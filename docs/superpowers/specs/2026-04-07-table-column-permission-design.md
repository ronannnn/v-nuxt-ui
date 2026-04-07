# Table 设置与权限系统设计方案

## 一、系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                        前端 (v-nuxt-ui)                     │
├─────────────────────────────────────────────────────────────┤
│  1. Table 系统配置                                            │
│     - Table 列表（行展开显示列数，action 进入 Modal 编辑）       │
│     - TableColumn 配置 Modal（增删改查列）                     │
├─────────────────────────────────────────────────────────────┤
│  2. 列权限配置（内嵌在 Role/User CreateModal）                 │
│     - Role: Tab 权限 Modal → 配置角色 Table 权限              │
│     - User: Tab 权限 Modal → 继承 Role + 用户额外配置          │
├─────────────────────────────────────────────────────────────┤
│  3. 用户 Table 设置                                          │
│     - 列设置：用户自定义列宽/顺序/固定/可见性（覆盖系统默认值）   │
│     - 权限：继承 Role + 用户直接配置的 CanView/CanEdit         │
└─────────────────────────────────────────────────────────────┘
```

## 二、文件结构

```
src/runtime/
├── types/models/table.ts           # Table/TableColumn/TablePermission/UserTableColumn 类型
├── composables/api/
│   ├── useTableApi.ts              # Table CRUD API
│   ├── useTableColumnApi.ts        # TableColumn CRUD + merged/user-config API
│   └── useTablePermissionApi.ts    # TablePermission CRUD + effective API
├── composables/table/
│   └── useTableColumnPermission.ts # 列配置 + 权限业务逻辑
└── components/
    ├── table/
    │   ├── settings/
    │   │   ├── TableSettings.vue       # 用户列设置界面
    │   │   └── UserTableColumnModal.vue
    │   └── permission/
    │       ├── TablePermissionConfig.vue    # 权限配置 Modal
    │       └── TablePermissionTab.vue       # Role/User Modal 内嵌 Tab
    └── sys/
        └── table/
            ├── Table.vue               # Table 列表页（行展开 + Modal 编辑）
            └── TableColumnModal.vue     # 列配置 Modal

playground/app/pages/examples/
└── table-settings.vue              # Table 设置测试页面
```

## 三、类型定义

```typescript
// Table 元数据
interface Table extends BaseModel {
  tblName: string
  label: string
  labelI18nKey?: string
}

// 系统列配置
interface TableColumn extends BaseModel {
  tableId: number
  columnKey: string
  label: string
  labelI18nKey?: string
  order: number
  width: number
  fixed: 'left' | 'right' | ''
  visible: boolean
}

// 用户个性化列配置（通过 tableColumnId 关联）
interface UserTableColumn extends BaseModel {
  userId: number
  tableColumnId: number
  order?: number
  width?: number
  fixed?: 'left' | 'right' | ''
  visible?: boolean
}

// 合并后列配置（非 DB 模型）
interface MergedTableColumn {
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
interface TablePermission extends BaseModel {
  name: string
  tableId: number
  canView?: boolean
  canEdit?: boolean
  columnPermissions?: TableColumnPermission[]
}

// 列级权限覆盖
interface TableColumnPermission extends BaseModel {
  tablePermissionId: number
  columnKey: string
  canView?: boolean
  canEdit?: boolean
}

// 有效权限（计算结果，非 DB 模型）
interface EffectiveTablePermission {
  isConfigured: boolean
  canViewTable: boolean
  canEditTable: boolean
  columns: Record<string, ColumnEffectivePerm>
}

interface ColumnEffectivePerm {
  canView: boolean
  canEdit: boolean
}
```

## 四、API 设计

| 接口 | 方法 | 路径 | 用途 |
|------|------|------|------|
| Table | CRUD | `/tables` | Table 元数据管理 |
| TableColumn | CRUD | `/table-columns` | 系统列配置管理 |
| TableColumn | GET | `/table-columns/merged?tblName=xxx` | 获取合并后列配置 |
| TableColumn | POST | `/table-columns/user-config` | 保存用户个性化列 |
| TablePermission | CRUD | `/table-permissions` | 权限配置管理 |
| TablePermission | GET | `/table-permissions/effective?tblName=xxx` | 获取有效权限 |

## 五、Key 交互设计

### 5.1 Table 系统配置（行展开 + Modal 编辑）

```
Table 列表
├── 行: [sys-users] [用户信息] [列数: 12] [展开▼] [操作按钮]
│   └── 展开: 显示所有列的简要信息（不可编辑）
└── 操作按钮下拉: [编辑 Table] [配置列] [删除]
    └── 配置列 → TableColumnModal（独立 Modal 编辑列）
```

### 5.2 Role/User 权限配置（Modal 模式）

```
Role CreateModal
├── Tab: [基本信息] [菜单权限] [Table 权限]
│   └── Table 权限 Tab:
│       ├── [选择 Table] 下拉框
│       ├── 选中后显示:
│       │   ├── 表级: ☑ CanView  ☑ CanEdit
│       │   └── 列级: DataTable（ColumnKey | CanView | CanEdit）
│       ├── [+ 添加 Table 权限] [- 移除]
│       └── 已有权限列表（可编辑/删除）
```

### 5.3 用户 Table 设置

```
TableSettings.vue
├── 左侧: Table 列表（ selectable）
├── 右侧: 选中 Table 的列配置
│   └── DataTable: [列名] [宽度] [顺序] [固定] [可见] [操作]
│       └── 操作: 点击后弹出 UserTableColumnModal 编辑
```

## 六、数据流

### 6.1 获取合并列配置

```
TableColumn[] (系统) + UserTableColumn[] (用户) → MergedTableColumn[]
```

### 6.2 权限合并

```
Role.TablePermission[] (UNION) + User.TablePermission[] (UNION)
→ MergePermResults(role, user) → EffectiveTablePermission
→ 用户直接配置 > Role 配置
```

### 6.3 用户 Table 设置保存

```
UserTableColumn[] → POST /table-columns/user-config
```

## 七、权限语义规则

| 场景 | 行为 |
|------|------|
| 表未受保护（无 TablePermission 记录） | 完全不限制 |
| nil / false 的权限值 | 均视为拒绝 |
| CanEdit = true | 隐含 CanView = true |
| 列级权限 vs 表级 | 列级受表级约束（表级不允许 → 列级也不允许） |
| 多角色 | UNION（最宽松） |
| 角色 + 用户直接权限 | 用户优先 |
| 用户直接配置 > Role 配置 | 用户直接配置的列权限覆盖 Role 配置 |

## 八、实现顺序

1. **Types 定义** - 定义所有 TypeScript 类型
2. **API Composable** - 实现 Table/TableColumn/TablePermission API 调用
3. **useTableColumnPermission Composable** - 业务逻辑封装
4. **Table 系统配置组件** - Table.vue + TableColumnModal.vue
5. **TablePermission 配置组件** - TablePermissionConfig.vue + TablePermissionTab.vue
6. **用户 Table 设置组件** - TableSettings.vue + UserTableColumnModal.vue
7. **Playground 测试页面** - table-settings.vue 集成所有功能
8. **Role/User 集成** - 在 Role/User CreateModal 中嵌入 TablePermissionTab
