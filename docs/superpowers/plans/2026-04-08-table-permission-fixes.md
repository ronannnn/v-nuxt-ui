# Table 权限系统修复与完善计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复现有 Table 系统配置/权限组件中的各种 bug，补全 Mock 数据中的 M2M 关联，使 playground 中的 Table 管理、Role/User 权限配置、用户 Table 设置功能正常运行。

**Architecture:** 现有代码框架已搭建（类型、API composable、组件、mock 端点均已存在），本次聚焦于修复 bug、补全 mock 数据关联、修复组件逻辑错误。

**Tech Stack:** Vue 3 Composition API, Nuxt UI, TypeScript, Nitro Server Routes

---

## 文件结构（仅列出需修改的文件）

```
修改:
  playground/server/utils/mockData.ts              # 补 Role/User tablePermissions M2M
  playground/server/api/v1/roles/index.post.ts     # 保存 tablePermissions
  playground/server/api/v1/roles/index.put.ts      # 保存 tablePermissions
  playground/server/api/v1/roles/[id].get.ts       # 返回 tablePermissions
  playground/server/api/v1/roles/list.post.ts      # 返回 tablePermissions
  playground/server/api/v1/users/index.post.ts     # 保存 tablePermissions
  playground/server/api/v1/users/index.put.ts      # 保存 tablePermissions
  playground/server/api/v1/users/[id].get.ts       # 返回 tablePermissions
  playground/server/api/v1/users/list.post.ts      # 返回 tablePermissions
  playground/server/api/v1/table-permissions/effective.get.ts  # 基于当前用户角色计算
  src/runtime/components/table/settings/TableSettings.vue      # 修复双 script 块
  src/runtime/components/sys/table/Table.vue                   # 修复 count 调用
  src/runtime/components/sys/table/CreateModal.vue             # 修复 cell 渲染
  src/runtime/composables/api/sys/useRoleApi.ts               # prune 处理 tablePermissions
  src/runtime/composables/api/sys/useUserApi.ts               # prune 处理 tablePermissions
```

---

## Task 1: Mock 数据 - 补全 Role/User 的 tablePermissions 关联

**Files:**
- Modify: `playground/server/utils/mockData.ts`

- [ ] **Step 1: 添加 Role-TablePermission 和 User-TablePermission 关联存储**

在 `mockData.ts` 中，`MockRole` 和 `MockUser` 接口当前没有 `tablePermissions` 字段。添加 M2M 映射存储和关联查询函数。

在 `MockRole` interface 中添加 `tablePermissions` 字段：

```typescript
export interface MockRole {
  id: number
  name: string
  permission: string
  disabled: boolean
  remark?: string
  tablePermissions?: number[]  // table permission IDs
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
  version: number
}
```

在 `MockUser` interface 中添加 `tablePermissions` 字段：

```typescript
export interface MockUser {
  // ... existing fields ...
  tablePermissions?: number[]  // table permission IDs
  // ...
}
```

- [ ] **Step 2: 为已有的 Mock 角色/用户添加 tablePermissions 数据**

修改 roles 数组中的数据，给 `超级管理员(id=1)` 关联权限 1,4（用户表+角色表超管权限），`系统管理员(id=2)` 关联权限 2（管理员-用户表），`访客(id=11)` 关联权限 3（普通用户-用户表）：

```typescript
const roles: MockRole[] = [
  { id: 1, name: '超级管理员', permission: 'super_admin', disabled: false, remark: '拥有所有权限', tablePermissions: [1, 4], ... },
  { id: 2, name: '系统管理员', permission: 'sys_admin', disabled: false, remark: '负责系统配置与用户管理', tablePermissions: [2], ... },
  // ... 其余角色不变 ...
  { id: 11, name: '访客', permission: 'guest', disabled: false, remark: '只读访问权限', tablePermissions: [3], ... },
  // ...
]
```

给用户 `张三(id=1)` 直接关联权限 1,4（因为是管理员），不需给所有用户加。

- [ ] **Step 3: 创建 enrichRole 和 enrichUser 辅助函数**

添加 `enrichRoleWithTablePermissions` 函数，将 role 的 `tablePermissions` ID 数组替换为完整的 TablePermission 对象数组（含 columnPermissions）：

```typescript
export function enrichRoleWithTablePermissions(role: MockRole): MockRole & { tablePermissions: MockTablePermission[] } {
  const permIds = role.tablePermissions || []
  const perms = permIds
    .map(id => getTablePermissionById(id))
    .filter(Boolean) as MockTablePermission[]

  // 为每个 permission 附加 columnPermissions
  const enrichedPerms = perms.map(p => ({
    ...p,
    columnPermissions: getTableColumnPermissionsByTablePermissionId(p.id)
  }))

  return { ...role, tablePermissions: enrichedPerms }
}

export function enrichUserWithTablePermissions(user: MockUser): MockUser & { tablePermissions: MockTablePermission[] } {
  const permIds = user.tablePermissions || []
  const perms = permIds
    .map(id => getTablePermissionById(id))
    .filter(Boolean) as MockTablePermission[]

  const enrichedPerms = perms.map(p => ({
    ...p,
    columnPermissions: getTableColumnPermissionsByTablePermissionId(p.id)
  }))

  return { ...user, tablePermissions: enrichedPerms }
}
```

- [ ] **Step 4: 创建 saveRoleTablePermissions 和 saveUserTablePermissions 辅助函数**

这些函数在 create/update 时被调用，从 request body 中提取 `tablePermissions` 数组（含 id 列表或完整对象），存入 role/user 的 `tablePermissions` 字段：

```typescript
export function saveRoleTablePermissions(roleId: number, permissions: any[]): void {
  const role = getRoleById(roleId)
  if (!role) return
  // permissions 可能是 [{id: 1}, {id: 2}] 格式（prune 后）或完整对象
  role.tablePermissions = permissions.map(p => typeof p === 'number' ? p : p.id).filter(id => id > 0)
}

export function saveUserTablePermissions(userId: number, permissions: any[]): void {
  const user = getUserById(userId)
  if (!user) return
  user.tablePermissions = permissions.map(p => typeof p === 'number' ? p : p.id).filter(id => id > 0)
}
```

- [ ] **Step 5: Commit**

```bash
git add playground/server/utils/mockData.ts
git commit -m "feat(mock): add tablePermissions M2M to Role/User mock data"
```

---

## Task 2: Mock API - Role 端点支持 tablePermissions

**Files:**
- Modify: `playground/server/api/v1/roles/index.post.ts`
- Modify: `playground/server/api/v1/roles/index.put.ts`
- Modify: `playground/server/api/v1/roles/[id].get.ts`
- Modify: `playground/server/api/v1/roles/list.post.ts`

- [ ] **Step 1: 修改 roles/index.post.ts - 创建时保存 tablePermissions**

```typescript
// POST /api/v1/roles - create role
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { tablePermissions, ...roleData } = body
  const role = createRole(roleData)
  if (tablePermissions && Array.isArray(tablePermissions)) {
    saveRoleTablePermissions(role.id, tablePermissions)
  }
  return { error: null, data: enrichRoleWithTablePermissions(role) }
})
```

- [ ] **Step 2: 修改 roles/index.put.ts - 更新时保存 tablePermissions**

```typescript
// PUT /api/v1/roles - update role
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { tablePermissions, ...roleData } = body
  const role = updateRole(roleData)
  if (!role) {
    throw createError({ statusCode: 404, message: 'Role not found' })
  }
  if (tablePermissions !== undefined) {
    saveRoleTablePermissions(role.id, Array.isArray(tablePermissions) ? tablePermissions : [])
  }
  return { error: null, data: enrichRoleWithTablePermissions(role) }
})
```

- [ ] **Step 3: 修改 roles/[id].get.ts - 返回时包含 tablePermissions**

```typescript
// GET /api/v1/roles/:id
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const role = getRoleById(id)
  if (!role) {
    throw createError({ statusCode: 404, message: 'Role not found' })
  }
  return { error: null, data: enrichRoleWithTablePermissions(role) }
})
```

- [ ] **Step 4: 修改 roles/list.post.ts - 列表返回时包含 tablePermissions**

```typescript
// POST /api/v1/roles/list
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const result = queryRoles(body)
  return {
    error: null,
    data: {
      ...result,
      list: result.list.map(r => enrichRoleWithTablePermissions(r))
    }
  }
})
```

- [ ] **Step 5: Commit**

```bash
git add playground/server/api/v1/roles/
git commit -m "feat(mock-api): roles CRUD now handles tablePermissions"
```

---

## Task 3: Mock API - User 端点支持 tablePermissions

**Files:**
- Modify: `playground/server/api/v1/users/index.post.ts`
- Modify: `playground/server/api/v1/users/index.put.ts`
- Modify: `playground/server/api/v1/users/[id].get.ts`
- Modify: `playground/server/api/v1/users/list.post.ts`

- [ ] **Step 1: 修改 users/index.post.ts**

Same pattern as roles: extract `tablePermissions` from body, create user, then save the association.

```typescript
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { tablePermissions, ...userData } = body
  const user = createUser(userData)
  if (tablePermissions && Array.isArray(tablePermissions)) {
    saveUserTablePermissions(user.id, tablePermissions)
  }
  return { error: null, data: enrichUserWithTablePermissions(user) }
})
```

- [ ] **Step 2: 修改 users/index.put.ts**

```typescript
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { tablePermissions, ...userData } = body
  const user = updateUser(userData)
  if (!user) {
    throw createError({ statusCode: 404, message: 'User not found' })
  }
  if (tablePermissions !== undefined) {
    saveUserTablePermissions(user.id, Array.isArray(tablePermissions) ? tablePermissions : [])
  }
  return { error: null, data: enrichUserWithTablePermissions(user) }
})
```

- [ ] **Step 3: 修改 users/[id].get.ts**

```typescript
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const user = getUserById(id)
  if (!user) {
    throw createError({ statusCode: 404, message: 'User not found' })
  }
  return { error: null, data: enrichUserWithTablePermissions(user) }
})
```

- [ ] **Step 4: 修改 users/list.post.ts**

```typescript
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const result = queryUsers(body)
  return {
    error: null,
    data: {
      ...result,
      list: result.list.map(u => enrichUserWithTablePermissions(u))
    }
  }
})
```

- [ ] **Step 5: Commit**

```bash
git add playground/server/api/v1/users/
git commit -m "feat(mock-api): users CRUD now handles tablePermissions"
```

---

## Task 4: 修复 useRoleApi/useUserApi 的 prune 方法

**Files:**
- Modify: `src/runtime/composables/api/sys/useRoleApi.ts`
- Modify: `src/runtime/composables/api/sys/useUserApi.ts`

- [ ] **Step 1: 修改 useRoleApi.ts - prune 处理 tablePermissions**

当前 `prune` 只处理 `menus`（提取 ID 数组），需要同样处理 `tablePermissions`。tablePermissions 在 prune 时需要提取 `id` 字段：

```typescript
export const useRoleApi = createSharedComposable((): ApiGroup<Role> => ({
  ...useApi<Role>('/roles'),
  prune: (model: Role): Role => {
    const cloned = cloneJson(model)
    cloned.menus = useBizModel().extractIds(cloned.menus)
    cloned.tablePermissions = useBizModel().extractIds(cloned.tablePermissions)
    return cloned
  },
  copy: (model: Role): Role => ({
    id: 0,
    name: model.name,
    permission: model.permission,
    disabled: model.disabled,
    remark: model.remark,
    menus: model.menus,
    tablePermissions: model.tablePermissions
  })
}))
```

- [ ] **Step 2: 修改 useUserApi.ts - prune 处理 tablePermissions**

```typescript
prune: (model: User): User => {
  const cloned = cloneJson(model)
  delete cloned.jobTitle
  delete cloned.jobGrade
  delete cloned.department
  delete cloned.supervisor

  const bizModel = useBizModel()
  cloned.roles = bizModel.extractIds(cloned.roles)
  cloned.menus = bizModel.extractIds(cloned.menus)
  cloned.tablePermissions = bizModel.extractIds(cloned.tablePermissions)
  return cloned
},
copy: (model: User): User => ({
  id: 0,
  jobTitleId: model.jobTitleId,
  jobTitle: model.jobTitle,
  jobGradeId: model.jobGradeId,
  jobGrade: model.jobGrade,
  departmentId: model.departmentId,
  department: model.department,
  supervisorId: model.supervisorId,
  supervisor: model.supervisor,
  entryDate: model.entryDate,
  resignDate: model.resignDate,
  gender: model.gender,
  loginType: model.loginType,
  tablePermissions: model.tablePermissions
})
```

- [ ] **Step 3: Commit**

```bash
git add src/runtime/composables/api/sys/useRoleApi.ts src/runtime/composables/api/sys/useUserApi.ts
git commit -m "fix(api): prune/copy now handles tablePermissions for Role/User"
```

---

## Task 5: 修复 TableSettings.vue - 双 script 块问题

**Files:**
- Modify: `src/runtime/components/table/settings/TableSettings.vue`

- [ ] **Step 1: 合并两个 script 块为单个 `<script setup>`**

当前文件有两个 `<script>` 块：一个 `<script setup>` 只有 import，另一个普通 `<script>` 包含所有逻辑。这导致 `ref`、`onMounted` 等组合式 API 不在 setup 上下文中运行。

将所有逻辑移到 `<script setup>` 块中：

```vue
<script setup lang="ts">
import type { MergedTableColumn, UserTableColumn, Table } from '#v/types'
import { useTableColumnPermission } from '#v/composables/table/useTableColumnPermission'
import UserTableColumnModal from './UserTableColumnModal.vue'
import { ref, h, onMounted } from 'vue'

const { tables, fetchTables, fetchMergedColumns, saveUserColumns } = useTableColumnPermission()

const selectedTable = ref<Table | null>(null)
const mergedColumns = ref<MergedTableColumn[]>([])
const editingColumn = ref<MergedTableColumn | null>(null)
const showColumnModal = ref(false)
const saving = ref(false)

async function onTableSelect(table: Table) {
  selectedTable.value = table
  mergedColumns.value = await fetchMergedColumns(table.tblName ?? '')
}

function onEditColumn(column: MergedTableColumn) {
  editingColumn.value = column
  showColumnModal.value = true
}

async function onColumnSave(config: UserTableColumn) {
  if (!selectedTable.value) return
  saving.value = true
  try {
    await saveUserColumns(selectedTable.value.tblName ?? '', [config])
    mergedColumns.value = await fetchMergedColumns(selectedTable.value.tblName ?? '')
    showColumnModal.value = false
  } finally {
    saving.value = false
  }
}

const columns = [
  { accessorKey: 'label', header: '列名' },
  { accessorKey: 'columnKey', header: '列标识' },
  { accessorKey: 'width', header: '宽度' },
  { accessorKey: 'order', header: '顺序' },
  {
    accessorKey: 'fixed',
    header: '固定',
    cell: ({ row }: { row: { original: MergedTableColumn } }) => row.original.fixed || '-'
  },
  {
    accessorKey: 'visible',
    header: '可见',
    cell: ({ row }: { row: { original: MergedTableColumn } }) => row.original.visible ? '是' : '否'
  },
  {
    accessorKey: 'actions',
    header: '操作',
    cell: ({ row }: { row: { original: MergedTableColumn } }) => {
      if (!row.original.canEdit) return '-'
      return h('UButton', {
        size: 'sm',
        variant: 'link',
        label: '编辑',
        onClick: () => onEditColumn(row.original)
      })
    }
  }
]

onMounted(fetchTables)
</script>
```

Template 保持不变。

- [ ] **Step 2: Commit**

```bash
git add src/runtime/components/table/settings/TableSettings.vue
git commit -m "fix(TableSettings): merge dual script blocks into single script setup"
```

---

## Task 6: 修复 sys/table/Table.vue - count API 调用

**Files:**
- Modify: `src/runtime/components/sys/table/Table.vue`

- [ ] **Step 1: 修复 fetchTableMeta 中的 count 调用**

当前代码在循环中逐个调用 `tableColumnApi.count()` 和 `tablePermissionApi.count()`，但每次调用都 new 一个 useApi（`useTableColumnApi()` 在循环内调用），而且 count 的返回格式需要正确解包。

实际上 `useApi` 返回的 `count` 方法签名是 `(payload, customOptions?) => Promise<{ data: Ref<RequestResult<number>> }>`，所以 `columnResult.data.value?.data` 的解包是正确的。

问题在于：`useTableColumnApi()` 和 `useTablePermissionApi()` 使用了 `createSharedComposable`，在循环内部调用应该没问题。但 `count` 端点可能不存在于 mock API。检查是否有 `table-columns/count.post.ts` 和 `table-permissions/count.post.ts`。

**替代方案（更简单可靠）：** 用 list API 的 total 字段来获取数量，而不是 count 端点：

```typescript
async function fetchTableMeta(tables: Table[]) {
  const tableColumnApi = useTableColumnApi()
  const tablePermissionApi = useTablePermissionApi()
  const newMeta: Record<number, TableMeta> = {}

  await Promise.all(
    tables.map(async (table) => {
      const [columnResult, permissionResult] = await Promise.all([
        tableColumnApi.list({
          pagination: { pageNum: 1, pageSize: 1 },
          whereQuery: {
            items: [{ field: 'tableId', value: table.id, opr: 'eq' }]
          }
        }),
        tablePermissionApi.list({
          pagination: { pageNum: 1, pageSize: 1 },
          whereQuery: {
            items: [{ field: 'tableId', value: table.id, opr: 'eq' }]
          }
        })
      ])

      newMeta[table.id] = {
        columnCount: columnResult.data.value?.data?.total ?? 0,
        permissionCount: permissionResult.data.value?.data?.total ?? 0
      }
    })
  )

  tableMeta.value = { ...tableMeta.value, ...newMeta }
}
```

OR alternatively, add `count.post.ts` mock endpoint files. The list approach is simpler and avoids creating new endpoints.

- [ ] **Step 2: Commit**

```bash
git add src/runtime/components/sys/table/Table.vue
git commit -m "fix(sys/table): use list total instead of count for table meta"
```

---

## Task 7: 修复 sys/table/CreateModal.vue - cell 渲染

**Files:**
- Modify: `src/runtime/components/sys/table/CreateModal.vue`

- [ ] **Step 1: 修复 tableColumns 的 actions cell 渲染**

当前 `tableColumns` 的 `actions` 列 cell 函数返回一个普通对象 `{ type: 'div', class: ..., children: [...] }` 而不是 VNode。`ProSimpleTable` 使用 Nuxt UI 的 `<UTable>` 组件，cell 函数需要返回字符串或 VNode。

修复方式：使用 `h()` 函数创建 VNode：

```typescript
import { h } from 'vue'
import UButton from '@nuxt/ui/components/Button.vue'

// ...

const tableColumns: VColumn<ColumnRow>[] = [
  // ... 其他列保持不变 ...
  {
    accessorKey: 'fixed',
    header: '固定',
    size: 80,
    cell: ({ row }) => {
      const fixedMap: Record<string, string> = { '': '否', left: '左', right: '右' }
      return fixedMap[row.original.fixed] ?? '否'
    }
  },
  {
    accessorKey: 'visible',
    header: '显示',
    size: 60,
    cell: ({ row }) => row.original.visible ? '是' : '否'
  },
  {
    accessorKey: 'actions',
    header: '操作',
    size: 100,
    cell: ({ row }) => {
      const index = columns.value.findIndex(c => c.id === row.original.id && c.columnKey === row.original.columnKey)
      return h('div', { class: 'flex gap-1' }, [
        h(UButton, {
          label: '编辑',
          icon: 'i-lucide-edit',
          variant: 'ghost',
          size: 'xs',
          onClick: () => editColumn(index)
        }),
        h(UButton, {
          label: '删除',
          icon: 'i-lucide-trash-2',
          color: 'error',
          variant: 'ghost',
          size: 'xs',
          onClick: () => removeColumn(index)
        })
      ])
    }
  }
]
```

注意：需要从 `row.original` 找回 index（因为 TanStack Table 的 cell 上下文不直接提供 data array index）。

- [ ] **Step 2: 修复 `cell` 中 `row` 的类型**

当前 `fixed` 列的 cell 使用 `row.fixed` 而不是 `row.original.fixed`。在 TanStack Table 中，`row` 是 Row 对象，实际数据在 `row.original` 中。需要统一为 `row.original.xxx`。

- [ ] **Step 3: Commit**

```bash
git add src/runtime/components/sys/table/CreateModal.vue
git commit -m "fix(sys/table/CreateModal): fix cell rendering to use VNode and row.original"
```

---

## Task 8: 修复 effective.get.ts - 基于用户角色计算权限

**Files:**
- Modify: `playground/server/api/v1/table-permissions/effective.get.ts`

- [ ] **Step 1: 重写权限计算逻辑**

当前实现只是简单地遍历所有 tablePermissions，没有基于当前用户的角色来过滤。需要：

1. 从请求中获取当前用户（mock 环境可用 query param `userId`，默认 userId=1）
2. 获取用户的角色列表
3. 收集角色关联的 tablePermissions（UNION，最宽松）
4. 收集用户直接关联的 tablePermissions
5. 用户直接权限优先于角色权限

```typescript
import type { ColumnEffectivePerm, EffectiveTablePermission } from '#v/types'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const tblName = query.tblName as string
  const userId = Number(query.userId) || 1  // 默认用户 1

  // Find table by tblName
  const table = getTables().find(t => t.tblName === tblName)
  if (!table) {
    throw createError({ statusCode: 404, message: 'Table not found' })
  }

  const tableColumns = getTableColumnsByTableId(table.id)

  // Get user
  const user = getUserById(userId)
  if (!user) {
    throw createError({ statusCode: 404, message: 'User not found' })
  }

  // 1. Collect role-based permissions (UNION - most permissive)
  const rolePermIds = new Set<number>()
  // user.roles -> each role -> role.tablePermissions
  // In mock, roles don't have full objects, so we need to look up
  const userRoles = getRoles().filter(r => {
    // We don't have user-role M2M in mock either, so assume user has roles
    // For simplicity, check if user has roles field
    return false // TODO: implement if user-role M2M exists
  })

  // Get permissions from roles assigned to user
  const allRolePermIds: number[] = []
  // Since we don't have user-role M2M in mock, we use the role's tablePermissions directly
  // For now, collect all permissions for the table
  const rolePerms = getTablePermissions().filter(p => p.tableId === table.id)

  // Get user's direct permissions
  const userPermIds = user.tablePermissions || []
  const userDirectPerms = userPermIds
    .map(id => getTablePermissionById(id))
    .filter(p => p && p.tableId === table.id)

  // Merge: user direct perms override role perms
  // If user has direct perms for this table, use those; otherwise use role perms
  const effectivePerms = userDirectPerms.length > 0 ? userDirectPerms : rolePerms

  // Compute table-level permissions
  let canViewTable = false
  let canEditTable = false
  for (const tp of effectivePerms) {
    if (tp!.canView) canViewTable = true
    if (tp!.canEdit) canEditTable = true
  }

  // Compute column-level permissions
  const columns: Record<string, ColumnEffectivePerm> = {}
  for (const col of tableColumns) {
    let canView = col.visible
    let canEdit = false

    for (const tp of effectivePerms) {
      const colPerms = getTableColumnPermissionsByTablePermissionId(tp!.id)
      const colPerm = colPerms.find(cp => cp.columnKey === col.columnKey)
      if (colPerm) {
        canView = colPerm.canView ?? canView
        if (colPerm.canEdit) canEdit = true
      }
    }

    columns[col.columnKey] = { canView, canEdit }
  }

  const result: EffectiveTablePermission = {
    isConfigured: effectivePerms.length > 0,
    canViewTable,
    canEditTable,
    columns
  }

  return { error: null, data: result }
})
```

- [ ] **Step 2: Commit**

```bash
git add playground/server/api/v1/table-permissions/effective.get.ts
git commit -m "fix(mock-api): effective permissions now considers user's direct permissions"
```

---

## Task 9: 验证和 Playground 测试

- [ ] **Step 1: 运行 TypeScript 类型检查**

```bash
pnpm typecheck
```

Fix any type errors.

- [ ] **Step 2: 启动 playground**

```bash
pnpm dev
```

- [ ] **Step 3: 测试 Table 系统配置**

Navigate to `/examples/table-sys`:
- Verify table list loads with column/permission counts
- Verify create/edit modal works
- Verify column configuration in create modal renders buttons correctly

- [ ] **Step 4: 测试 Role 权限配置**

Navigate to `/examples/roles`:
- Edit a role (e.g. 超级管理员)
- Verify TablePermissionTab shows existing permissions
- Add/edit/remove table permissions
- Save and verify persistence

- [ ] **Step 5: 测试 User 权限配置**

Navigate to `/examples/users`:
- Edit a user
- Verify TablePermissionTab shows
- Add table permissions
- Save and verify

- [ ] **Step 6: 测试用户 Table 设置**

Navigate to `/examples/table-user-settings`:
- Select a table from left sidebar
- Verify merged columns load
- Edit a column setting
- Save and verify

---

## 依赖关系

```
Task 1 (Mock Data M2M)
    ↓
Task 2 (Role API) + Task 3 (User API)  [parallel]
    ↓
Task 4 (prune/copy fixes)
    ↓
Task 5 (TableSettings fix) + Task 6 (Table.vue fix) + Task 7 (CreateModal fix) + Task 8 (effective fix)  [parallel]
    ↓
Task 9 (验证)
```
