# Table 设置与权限系统实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现 Table 系统配置、Role/User Table 权限配置、用户 Table 设置完整功能

**Architecture:** 基于现有 v-nuxt-ui 组件库架构，新增 Table/TableColumn/TablePermission 相关类型、API 和组件，采用 LocalStorage 缓存 + API 同步模式

**Tech Stack:** Vue 3 Composition API, Nuxt UI, TanStack Table, TypeScript

---

## 文件结构

```
src/runtime/
├── types/models/table.ts           # 新增: Table/TableColumn/TablePermission 类型
├── composables/api/
│   ├── useTableApi.ts              # 新增: Table CRUD API
│   ├── useTableColumnApi.ts       # 新增: TableColumn CRUD + merged/user-config API
│   └── useTablePermissionApi.ts    # 新增: TablePermission CRUD + effective API
├── composables/table/
│   └── useTableColumnPermission.ts # 新增: 列配置 + 权限业务逻辑
└── components/
    ├── table/
    │   ├── settings/
    │   │   ├── TableSettings.vue       # 新增: 用户列设置界面
    │   │   └── UserTableColumnModal.vue # 新增: 用户列编辑 Modal
    │   └── permission/
    │       ├── TablePermissionConfig.vue    # 新增: 权限配置 Modal
    │       └── TablePermissionTab.vue       # 新增: Role/User Modal 内嵌 Tab
    └── sys/
        └── table/
            ├── Table.vue               # 新增: Table 列表页
            └── TableColumnModal.vue     # 新增: 列配置 Modal

playground/app/pages/examples/
└── table-settings.vue              # 新增: Table 设置测试页面
```

---

## Task 1: 类型定义

**Files:**
- Create: `src/runtime/types/models/table.ts`

- [ ] **Step 1: 创建类型定义文件**

```typescript
// src/runtime/types/models/table.ts

import type { BaseModel } from './base'

// Table 元数据
export interface Table extends BaseModel {
  tblName: string
  label: string
  labelI18nKey?: string
}

// 系统列配置
export interface TableColumn extends BaseModel {
  tableId: number
  columnKey: string
  label: string
  labelI18nKey?: string
  order: number
  width: number
  fixed: 'left' | 'right' | ''
  visible: boolean
}

// 用户个性化列配置
export interface UserTableColumn extends BaseModel {
  userId: number
  tableColumnId: number
  order?: number
  width?: number
  fixed?: 'left' | 'right' | ''
  visible?: boolean
}

// 合并后列配置
export interface MergedTableColumn {
  columnKey: string
  label: string
  i18nKey?: string
  order: number
  width: number
  fixed: 'left' | 'right' | ''
  visible: boolean
  canView: boolean
  canEdit: boolean
}

// 表权限配置
export interface TablePermission extends BaseModel {
  name: string
  tableId: number
  canView?: boolean
  canEdit?: boolean
  columnPermissions?: TableColumnPermission[]
}

// 列级权限覆盖
export interface TableColumnPermission extends BaseModel {
  tablePermissionId: number
  columnKey: string
  canView?: boolean
  canEdit?: boolean
}

// 有效权限（计算结果）
export interface EffectiveTablePermission {
  isConfigured: boolean
  canViewTable: boolean
  canEditTable: boolean
  columns: Record<string, ColumnEffectivePerm>
}

export interface ColumnEffectivePerm {
  canView: boolean
  canEdit: boolean
}
```

- [ ] **Step 2: 导出类型**

修改 `src/runtime/types/models/index.ts`:

```typescript
export * from './table'
```

- [ ] **Step 3: Commit**

```bash
git add src/runtime/types/models/table.ts src/runtime/types/models/index.ts
git commit -m "feat(types): add Table/TableColumn/TablePermission types"
```

---

## Task 2: API Composable

**Files:**
- Create: `src/runtime/composables/api/useTableApi.ts`
- Create: `src/runtime/composables/api/useTableColumnApi.ts`
- Create: `src/runtime/composables/api/useTablePermissionApi.ts`

- [ ] **Step 1: 创建 Table API**

```typescript
// src/runtime/composables/api/useTableApi.ts
import { createSharedComposable } from '@vueuse/core'
import { useApi } from './useApi'
import type { ApiGroup, Table } from '#v/types'

export const useTableApi = createSharedComposable((): ApiGroup<Table> => ({
  ...useApi<Table>('/tables')
}))
```

- [ ] **Step 2: 创建 TableColumn API（含特殊端点）**

```typescript
// src/runtime/composables/api/useTableColumnApi.ts
import { createSharedComposable } from '@vueuse/core'
import { useApi } from './useApi'
import { usePostFetch, useGetFetch } from './useApi'
import type { ApiGroup, TableColumn, UserTableColumn, MergedTableColumn } from '#v/types'
import type { Ref } from 'vue'
import type { RequestResult } from '#v/types'

export const useTableColumnApi = createSharedComposable((): ApiGroup<TableColumn> & {
  getMergedColumns(tblName: string): Promise<{ data: Ref<RequestResult<MergedTableColumn[]>> }>
  saveUserColumns(tblName: string, configs: UserTableColumn[]): Promise<{ data: Ref<RequestResult<void>> }>
} => ({
  ...useApi<TableColumn>('/table-columns'),
  async getMergedColumns(tblName: string) {
    return useGetFetch<MergedTableColumn[]>(`/table-columns/merged?tblName=${tblName}`)
  },
  async saveUserColumns(tblName: string, configs: UserTableColumn[]) {
    return usePostFetch<void>('/table-columns/user-config', { tblName, configs })
  }
}))
```

- [ ] **Step 3: 创建 TablePermission API**

```typescript
// src/runtime/composables/api/useTablePermissionApi.ts
import { createSharedComposable } from '@vueuse/core'
import { useApi } from './useApi'
import { usePostFetch } from './useApi'
import type { ApiGroup, TablePermission, EffectiveTablePermission } from '#v/types'
import type { Ref } from 'vue'
import type { RequestResult } from '#v/types'

export const useTablePermissionApi = createSharedComposable((): ApiGroup<TablePermission> & {
  getEffectivePermissions(tblName: string): Promise<{ data: Ref<RequestResult<EffectiveTablePermission>> }>
} => ({
  ...useApi<TablePermission>('/table-permissions'),
  async getEffectivePermissions(tblName: string) {
    return useGetFetch<EffectiveTablePermission>(`/table-permissions/effective?tblName=${tblName}`)
  }
}))
```

- [ ] **Step 4: 更新 sys API 导出**

修改 `src/runtime/composables/api/sys/index.ts`:

```typescript
export * from './useTableApi'
export * from './useTableColumnApi'
export * from './useTablePermissionApi'
```

- [ ] **Step 5: Commit**

```bash
git add src/runtime/composables/api/useTableApi.ts src/runtime/composables/api/useTableColumnApi.ts src/runtime/composables/api/useTablePermissionApi.ts src/runtime/composables/api/sys/index.ts
git commit -m "feat(api): add Table/TableColumn/TablePermission API composables"
```

---

## Task 3: useTableColumnPermission Composable

**Files:**
- Create: `src/runtime/composables/table/useTableColumnPermission.ts`

- [ ] **Step 1: 创建业务逻辑 Composable**

```typescript
// src/runtime/composables/table/useTableColumnPermission.ts
import { ref, computed } from 'vue'
import { useTableColumnApi, useTablePermissionApi, useTableApi, useUserApi } from '#v/composables/api'
import type { Table, TableColumn, UserTableColumn, MergedTableColumn, EffectiveTablePermission } from '#v/types'

export function useTableColumnPermission() {
  const tableApi = useTableApi()
  const tableColumnApi = useTableColumnApi()
  const tablePermissionApi = useTablePermissionApi()

  // 所有 Table 列表
  const tables = ref<Table[]>([])
  const tablesLoading = ref(false)

  async function fetchTables() {
    tablesLoading.value = true
    try {
      const { data } = await tableApi.list({ pagination: { pageNum: 0, pageSize: 0 } })
      if (data.value.data) {
        tables.value = data.value.data.list
      }
    } finally {
      tablesLoading.value = false
    }
  }

  // 获取某 Table 的系统列配置
  async function fetchColumnsByTableId(tableId: number): Promise<TableColumn[]> {
    const { data } = await tableColumnApi.list({
      pagination: { pageNum: 0, pageSize: 0 },
      whereQuery: { items: [{ field: 'tableId', value: tableId }] }
    })
    return data.value.data?.list ?? []
  }

  // 获取用户合并后的列配置
  async function fetchMergedColumns(tblName: string): Promise<MergedTableColumn[]> {
    const { data } = await tableColumnApi.getMergedColumns(tblName)
    return data.value.data ?? []
  }

  // 获取有效权限
  async function fetchEffectivePermissions(tblName: string): Promise<EffectiveTablePermission | null> {
    const { data } = await tablePermissionApi.getEffectivePermissions(tblName)
    return data.value.data ?? null
  }

  // 保存用户列配置
  async function saveUserColumns(tblName: string, configs: UserTableColumn[]) {
    await tableColumnApi.saveUserColumns(tblName, configs)
  }

  return {
    tables,
    tablesLoading,
    fetchTables,
    fetchColumnsByTableId,
    fetchMergedColumns,
    fetchEffectivePermissions,
    saveUserColumns
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/runtime/composables/table/useTableColumnPermission.ts
git commit -m "feat(composable): add useTableColumnPermission composable"
```

---

## Task 4: Table 系统配置组件

**Files:**
- Create: `src/runtime/components/sys/table/Table.vue`
- Create: `src/runtime/components/sys/table/TableColumnModal.vue`

- [ ] **Step 1: 创建 Table.vue（Table 列表页）**

参考 `src/runtime/components/sys/role/Table.vue` 模式：

```vue
<!-- src/runtime/components/sys/table/Table.vue -->
<script setup lang="ts">
import type { VColumn, Table } from '#v/types'
import { useOverlay } from '@nuxt/ui/composables'
import { useTableApi, useTableColumnApi } from '#v/composables/api'
import TableColumnModal from './TableColumnModal.vue'
import TablePage from '#v/components/table/Page.vue'
import { h, ref } from 'vue'

const overlay = useOverlay()
const columnModal = overlay.create(TableColumnModal)

const columns: VColumn<Table>[] = [
  {
    accessorKey: 'tblName',
    header: '表名',
    sortOption: true,
    filterOption: { type: 'input' }
  },
  {
    accessorKey: 'label',
    header: '显示名',
    sortOption: true,
    filterOption: { type: 'input' }
  },
  {
    accessorKey: 'columnCount',
    header: '列数',
    cell: ({ row }) => row.original.columnCount ?? '-'
  },
  ...getOprColumns()
]
</script>

<template>
  <TablePage
    name="sys-table"
    cn-name="Table 配置"
    :use-api-group="useTableApi"
    :biz-columns="columns"
    :expandable="true"
    :expand-v-node="(row) => h('div', { class: 'p-4' }, `列数: ${row.columnCount ?? 0}`)"
    @edit-row-from-modal="handleEdit"
  />
</template>
```

- [ ] **Step 2: 创建 TableColumnModal.vue（列配置 Modal）**

```vue
<!-- src/runtime/components/sys/table/TableColumnModal.vue -->
<script setup lang="ts">
import type { TableColumn, Table } from '#v/types'
import { useTableColumnApi } from '#v/composables/api'
import { ref } from 'vue'

const props = defineProps<{
  table: Table
}>()

const emit = defineEmits<{
  close: [boolean]
  save: [TableColumn[]]
}>()

const columns = ref<TableColumn[]>([])
const loading = ref(false)

async function fetchColumns() {
  loading.value = true
  const { data } = await useTableColumnApi().list({
    pagination: { pageNum: 0, pageSize: 0 },
    whereQuery: { items: [{ field: 'tableId', value: props.table.id }] }
  })
  if (data.value.data) {
    columns.value = data.value.data.list
  }
  loading.value = false
}

onMounted(fetchColumns)
</script>

<template>
  <UModal title="配置列">
    <!-- 列配置表格 -->
  </UModal>
</template>
```

- [ ] **Step 3: Commit**

```bash
git add src/runtime/components/sys/table/Table.vue src/runtime/components/sys/table/TableColumnModal.vue
git commit -m "feat(sys/table): add Table list and column config components"
```

---

## Task 5: TablePermission 配置组件

**Files:**
- Create: `src/runtime/components/table/permission/TablePermissionConfig.vue`
- Create: `src/runtime/components/table/permission/TablePermissionTab.vue`

- [ ] **Step 1: 创建 TablePermissionConfig.vue（权限配置 Modal）**

```vue
<!-- src/runtime/components/table/permission/TablePermissionConfig.vue -->
<script setup lang="ts">
import type { TablePermission, Table, TableColumn } from '#v/types'
import { useTablePermissionApi, useTableApi } from '#v/composables/api'
import { ref, computed } from 'vue'

const props = defineProps<{
  permission?: TablePermission  // 编辑时传入
}>()

const emit = defineEmits<{
  close: [boolean]
  save: [TablePermission]
}>()

const tables = ref<Table[]>([])
const selectedTable = ref<Table | null>(null)
const canView = ref(false)
const canEdit = ref(false)
const columnPermissions = ref<{ columnKey: string; canView: boolean; canEdit: boolean }[]>([])

async function fetchTables() {
  const { data } = await useTableApi().list({ pagination: { pageNum: 0, pageSize: 0 } })
  if (data.value.data) {
    tables.value = data.value.data.list
  }
}

async function onTableChange(table: Table) {
  selectedTable.value = table
  // 加载该表的列配置...
}

function addColumnPermission() {
  columnPermissions.value.push({ columnKey: '', canView: true, canEdit: false })
}

function removeColumnPermission(index: number) {
  columnPermissions.value.splice(index, 1)
}

async function onSave() {
  // 保存逻辑...
}

onMounted(fetchTables)
</script>

<template>
  <UModal title="配置 Table 权限">
    <div class="space-y-4">
      <!-- Table 选择 -->
      <USelect v-model="selectedTable" :items="tables" label="选择 Table" @change="onTableChange" />
      
      <!-- 表级权限 -->
      <div class="flex gap-4">
        <UCheckbox v-model="canView" label="可查看" />
        <UCheckbox v-model="canEdit" label="可编辑" />
      </div>
      
      <!-- 列级权限 -->
      <div v-for="(col, idx) in columnPermissions" :key="idx" class="flex gap-2 items-center">
        <UInput v-model="col.columnKey" placeholder="列名" />
        <UCheckbox v-model="col.canView" label="查看" />
        <UCheckbox v-model="col.canEdit" label="编辑" />
        <UButton icon="i-lucide-trash" variant="ghost" @click="removeColumnPermission(idx)" />
      </div>
      
      <UButton icon="i-lucide-plus" label="添加列权限" @click="addColumnPermission" />
    </div>
    
    <template #footer>
      <UButton label="取消" @click="emit('close', false)" />
      <UButton label="保存" @click="onSave" />
    </template>
  </UModal>
</template>
```

- [ ] **Step 2: 创建 TablePermissionTab.vue（内嵌 Tab）**

```vue
<!-- src/runtime/components/table/permission/TablePermissionTab.vue -->
<script setup lang="ts">
import type { TablePermission } from '#v/types'
import TablePermissionConfig from './TablePermissionConfig.vue'
import { useOverlay } from '@nuxt/ui/composables'

const props = defineProps<{
  modelValue: TablePermission[]
}>()

const emit = defineEmits<{
  'update:modelValue': [TablePermission[]]
}>()

const overlay = useOverlay()
const configModal = overlay.create(TablePermissionConfig)

function addPermission() {
  configModal.open().then(result => {
    if (result) {
      emit('update:modelValue', [...props.modelValue, result])
    }
  })
}

function removePermission(index: number) {
  const newPerms = [...props.modelValue]
  newPerms.splice(index, 1)
  emit('update:modelValue', newPerms)
}
</script>

<template>
  <div class="space-y-2">
    <div v-for="(perm, idx) in modelValue" :key="idx" class="flex items-center gap-2 p-2 border rounded">
      <span>{{ perm.table?.tblName }}</span>
      <UCheckbox v-model="perm.canView" label="查看" disabled />
      <UCheckbox v-model="perm.canEdit" label="编辑" disabled />
      <UButton icon="i-lucide-trash" variant="ghost" @click="removePermission(idx)" />
    </div>
    <UButton icon="i-lucide-plus" label="添加 Table 权限" @click="addPermission" />
  </div>
</template>
```

- [ ] **Step 3: Commit**

```bash
git add src/runtime/components/table/permission/TablePermissionConfig.vue src/runtime/components/table/permission/TablePermissionTab.vue
git commit -m "feat(table/permission): add TablePermission config components"
```

---

## Task 6: 用户 Table 设置组件

**Files:**
- Create: `src/runtime/components/table/settings/TableSettings.vue`
- Create: `src/runtime/components/table/settings/UserTableColumnModal.vue`

- [ ] **Step 1: 创建 TableSettings.vue**

```vue
<!-- src/runtime/components/table/settings/TableSettings.vue -->
<script setup lang="ts">
import type { Table, MergedTableColumn, UserTableColumn } from '#v/types'
import { useTableColumnPermission } from '#v/composables/table/useTableColumnPermission'
import UserTableColumnModal from './UserTableColumnModal.vue'
import { ref } from 'vue'

const { tables, fetchTables, fetchMergedColumns } = useTableColumnPermission()

const selectedTable = ref<Table | null>(null)
const mergedColumns = ref<MergedTableColumn[]>([])

async function onTableSelect(table: Table) {
  selectedTable.value = table
  mergedColumns.value = await fetchMergedColumns(table.tblName)
}

onMounted(fetchTables)
</script>

<template>
  <div class="flex gap-4 h-full">
    <!-- 左侧 Table 列表 -->
    <div class="w-64 border-r pr-4">
      <div class="font-bold mb-2">选择 Table</div>
      <div v-for="table in tables" :key="table.id" 
           class="p-2 cursor-pointer rounded"
           :class="{ 'bg-primary text-white': selectedTable?.id === table.id }"
           @click="onTableSelect(table)">
        {{ table.label }} ({{ table.tblName }})
      </div>
    </div>
    
    <!-- 右侧列配置 -->
    <div class="flex-1">
      <template v-if="selectedTable">
        <div class="font-bold mb-2">列配置 - {{ selectedTable.label }}</div>
        <UTable :data="mergedColumns" :columns="columns">
          <!-- 列配置操作按钮 -->
        </UTable>
      </template>
    </div>
  </div>
</template>
```

- [ ] **Step 2: 创建 UserTableColumnModal.vue**

```vue
<!-- src/runtime/components/table/settings/UserTableColumnModal.vue -->
<script setup lang="ts">
import type { MergedTableColumn, UserTableColumn } from '#v/types'

const props = defineProps<{
  column: MergedTableColumn
}>()

const emit = defineEmits<{
  close: [boolean]
  save: [UserTableColumn]
}>()

const width = ref(props.column.width)
const order = ref(props.column.order)
const fixed = ref(props.column.fixed)
const visible = ref(props.column.visible)
</script>

<template>
  <UModal title="编辑列设置">
    <div class="space-y-4">
      <UInput v-model="width" label="宽度" type="number" />
      <UInput v-model="order" label="顺序" type="number" />
      <USelect v-model="fixed" label="固定位置" :items="['left', 'right', '']" />
      <UCheckbox v-model="visible" label="可见" />
    </div>
    <template #footer>
      <UButton label="取消" @click="emit('close', false)" />
      <UButton label="保存" @click="emit('save', { width, order, fixed, visible })" />
    </template>
  </UModal>
</template>
```

- [ ] **Step 3: Commit**

```bash
git add src/runtime/components/table/settings/TableSettings.vue src/runtime/components/table/settings/UserTableColumnModal.vue
git commit -m "feat(table/settings): add user table settings components"
```

---

## Task 7: Playground 测试页面

**Files:**
- Create: `playground/app/pages/examples/table-settings.vue`

- [ ] **Step 1: 创建测试页面**

```vue
<!-- playground/app/pages/examples/table-settings.vue -->
<script setup lang="ts">
definePageMeta({
  layout: 'examples'
})
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Table 设置</h1>
    
    <div class="mb-4 flex gap-2">
      <UButton label="Table 系统配置" to="/examples/sys-table" />
      <UButton label="用户 Table 设置" to="/examples/user-table-settings" />
    </div>
    
    <TableSettings />
  </div>
</template>
```

- [ ] **Step 2: 创建路由（如果需要）**

根据现有 playground 结构添加路由

- [ ] **Step 3: Commit**

```bash
git add playground/app/pages/examples/table-settings.vue
git commit -m "feat(playground): add table settings test page"
```

---

## Task 8: Role/User CreateModal 集成 TablePermissionTab

**Files:**
- Modify: `src/runtime/components/sys/role/CreateModal.vue`
- Modify: `src/runtime/components/sys/user/CreateModal.vue`

- [ ] **Step 1: 在 Role CreateModal 中添加 Tab**

参考现有 Role CreateModal 结构，添加 Table 权限 Tab

- [ ] **Step 2: 在 User CreateModal 中添加 Tab**

参考现有 User CreateModal 结构，添加 Table 权限 Tab

- [ ] **Step 3: Commit**

```bash
git add src/runtime/components/sys/role/CreateModal.vue src/runtime/components/sys/user/CreateModal.vue
git commit -m "feat(sys): integrate TablePermissionTab in Role/User CreateModal"
```

---

## Task 9: Playground 测试并验证

- [ ] **Step 1: 启动 playground**

```bash
pnpm dev
```

- [ ] **Step 2: 测试 Table 系统配置**
- 添加/编辑/删除 Table
- 配置 TableColumn
- 验证展开行显示

- [ ] **Step 3: 测试 Role/User 权限配置**
- 在 Role CreateModal 中添加 Table 权限
- 在 User CreateModal 中验证继承和覆盖

- [ ] **Step 4: 测试用户 Table 设置**
- 选择 Table
- 修改列设置
- 验证合并后的列配置

---

## 依赖关系

```
Task 1 (Types)
    ↓
Task 2 (API)
    ↓
Task 3 (Composable)
    ↓
Task 4, 5, 6 (Components - 可并行)
    ↓
Task 7 (Playground 测试)
    ↓
Task 8 (Role/User 集成)
    ↓
Task 9 (完整测试)
```

---

**Plan 完成。执行方式选择：**

1. **Subagent-Driven (推荐)** - 每个 Task 派遣独立 subagent 执行
2. **Inline Execution** - 在当前 session 中按序执行

选择哪种方式？
