// Mock Table data
export interface MockTable {
  id: number
  tblName: string
  label: string
  labelI18nKey?: string
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
  version: number
}

export interface MockTableColumn {
  id: number
  tableId: number
  columnKey: string
  label: string
  labelI18nKey?: string
  order: number
  width: number
  fixed: 'left' | 'right' | ''
  visible: boolean
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
  version: number
}

export interface MockTablePermission {
  id: number
  name: string
  tableId: number
  canView?: boolean
  canEdit?: boolean
  columnPermissions?: MockTableColumnPermission[]
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
  version: number
}

export interface MockTableColumnPermission {
  id: number
  tablePermissionId: number
  columnKey: string
  canView?: boolean
  canEdit?: boolean
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
  version: number
}

export interface MockUserTableColumn {
  id: number
  userId: number
  tableColumnId: number
  order?: number
  width?: number
  fixed?: 'left' | 'right' | ''
  visible?: boolean
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
  version: number
}

// ─── Table mock data ───────────────────────────────────────────────────────────

const tables: MockTable[] = [
  { id: 1, tblName: 'sys_user', label: '用户表', labelI18nKey: 'table.sys_user', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 },
  { id: 2, tblName: 'sys_role', label: '角色表', labelI18nKey: 'table.sys_role', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 },
  { id: 3, tblName: 'sys_menu', label: '菜单表', labelI18nKey: 'table.sys_menu', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 },
  { id: 4, tblName: 'sys_department', label: '部门表', labelI18nKey: 'table.sys_department', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 },
  { id: 5, tblName: 'ops_notice', label: '公告表', labelI18nKey: 'table.ops_notice', createdAt: '2024-06-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 },
  { id: 6, tblName: 'finance_expense', label: '报销表', labelI18nKey: 'table.finance_expense', createdAt: '2024-06-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 }
]

let nextTableId = 7

export function getTables() {
  return tables
}

export function getTableById(id: number) {
  return tables.find(t => t.id === id)
}

export function createTable(data: Partial<MockTable>): MockTable {
  const now = new Date().toISOString()
  const table: MockTable = {
    id: nextTableId++,
    tblName: data.tblName || '',
    label: data.label || '',
    labelI18nKey: data.labelI18nKey,
    createdAt: now,
    updatedAt: now,
    createdBy: 'playground',
    updatedBy: 'playground',
    version: 1
  }
  tables.push(table)
  return table
}

export function updateTable(data: Partial<MockTable>): MockTable | null {
  const idx = tables.findIndex(t => t.id === data.id)
  if (idx === -1) return null
  const updated: MockTable = {
    ...tables[idx]!,
    ...data,
    updatedAt: new Date().toISOString(),
    updatedBy: 'playground',
    version: tables[idx]!.version + 1
  }
  tables[idx] = updated
  return updated
}

export function deleteTables(ids: number[]): void {
  for (const id of ids) {
    const idx = tables.findIndex(t => t.id === id)
    if (idx !== -1) tables.splice(idx, 1)
  }
}

export function queryTables(body: any) {
  let filtered = [...tables]

  if (body.whereQuery?.items) {
    for (const item of body.whereQuery.items) {
      if (item.value === null || item.value === undefined || item.value === '') continue
      const field = item.field as string
      const opr = item.opr as string
      const value = item.value

      filtered = filtered.filter((table) => {
        const fieldValue = getNestedValue(table, field)
        switch (opr) {
          case 'eq': return fieldValue === value
          case 'ne': return fieldValue !== value
          case 'like': return String(fieldValue ?? '').toLowerCase().includes(String(value).toLowerCase())
          case 'start_like': return String(fieldValue ?? '').toLowerCase().startsWith(String(value).toLowerCase())
          case 'in': return Array.isArray(value) ? value.includes(fieldValue) : fieldValue === value
          case 'not_in': return Array.isArray(value) ? !value.includes(fieldValue) : fieldValue !== value
          default: return true
        }
      })
    }
  }

  if (body.orderQuery && body.orderQuery.length > 0) {
    filtered.sort((a, b) => {
      for (const order of body.orderQuery) {
        const field = order.field as string
        const aVal = getNestedValue(a, field)
        const bVal = getNestedValue(b, field)
        if (aVal === bVal) continue
        const dir = order.order === 'desc' ? -1 : 1
        if (aVal == null) return dir
        if (bVal == null) return -dir
        return aVal < bVal ? -dir : dir
      }
      return 0
    })
  }

  const total = filtered.length
  const pageNum = body.pagination?.pageNum || 1
  const pageSize = body.pagination?.pageSize || 10

  if (pageSize > 0) {
    const start = (pageNum - 1) * pageSize
    filtered = filtered.slice(start, start + pageSize)
  }

  return {
    list: filtered,
    total,
    pageNum,
    pageSize: pageSize || total
  }
}

// ─── TableColumn mock data ─────────────────────────────────────────────────────

const tableColumns: MockTableColumn[] = [
  // sys_user columns
  { id: 1, tableId: 1, columnKey: 'id', label: 'ID', order: 1, width: 80, fixed: 'left', visible: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 },
  { id: 2, tableId: 1, columnKey: 'nickname', label: '昵称', order: 2, width: 120, fixed: '', visible: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 },
  { id: 3, tableId: 1, columnKey: 'username', label: '用户名', order: 3, width: 120, fixed: '', visible: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 },
  { id: 4, tableId: 1, columnKey: 'email', label: '邮箱', order: 4, width: 180, fixed: '', visible: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 },
  { id: 5, tableId: 1, columnKey: 'gender', label: '性别', order: 5, width: 80, fixed: '', visible: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 },
  { id: 6, tableId: 1, columnKey: 'department', label: '部门', order: 6, width: 120, fixed: '', visible: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 },
  { id: 7, tableId: 1, columnKey: 'isAdmin', label: '管理员', order: 7, width: 80, fixed: '', visible: false, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 },
  { id: 8, tableId: 1, columnKey: 'status', label: '状态', order: 8, width: 100, fixed: '', visible: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 },
  { id: 9, tableId: 1, columnKey: 'entryDate', label: '入职日期', order: 9, width: 120, fixed: '', visible: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 },
  { id: 10, tableId: 1, columnKey: 'telNo', label: '电话', order: 10, width: 130, fixed: '', visible: false, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 },
  { id: 11, tableId: 1, columnKey: 'actions', label: '操作', order: 99, width: 150, fixed: 'right', visible: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 },

  // sys_role columns
  { id: 12, tableId: 2, columnKey: 'id', label: 'ID', order: 1, width: 80, fixed: 'left', visible: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 },
  { id: 13, tableId: 2, columnKey: 'name', label: '角色名称', order: 2, width: 150, fixed: '', visible: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 },
  { id: 14, tableId: 2, columnKey: 'permission', label: '权限标识', order: 3, width: 150, fixed: '', visible: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 },
  { id: 15, tableId: 2, columnKey: 'disabled', label: '状态', order: 4, width: 100, fixed: '', visible: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 },
  { id: 16, tableId: 2, columnKey: 'remark', label: '备注', order: 5, width: 200, fixed: '', visible: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 },
  { id: 17, tableId: 2, columnKey: 'actions', label: '操作', order: 99, width: 150, fixed: 'right', visible: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 }
]

let nextTableColumnId = 18

export function getTableColumns() {
  return tableColumns
}

export function getTableColumnById(id: number) {
  return tableColumns.find(c => c.id === id)
}

export function getTableColumnsByTableId(tableId: number) {
  return tableColumns.filter(c => c.tableId === tableId)
}

export function createTableColumn(data: Partial<MockTableColumn>): MockTableColumn {
  const now = new Date().toISOString()
  const col: MockTableColumn = {
    id: nextTableColumnId++,
    tableId: data.tableId || 0,
    columnKey: data.columnKey || '',
    label: data.label || '',
    labelI18nKey: data.labelI18nKey,
    order: data.order || 0,
    width: data.width || 100,
    fixed: data.fixed || '',
    visible: data.visible ?? true,
    createdAt: now,
    updatedAt: now,
    createdBy: 'playground',
    updatedBy: 'playground',
    version: 1
  }
  tableColumns.push(col)
  return col
}

export function updateTableColumn(data: Partial<MockTableColumn>): MockTableColumn | null {
  const idx = tableColumns.findIndex(c => c.id === data.id)
  if (idx === -1) return null
  const updated: MockTableColumn = {
    ...tableColumns[idx]!,
    ...data,
    updatedAt: new Date().toISOString(),
    updatedBy: 'playground',
    version: tableColumns[idx]!.version + 1
  }
  tableColumns[idx] = updated
  return updated
}

export function deleteTableColumns(ids: number[]): void {
  for (const id of ids) {
    const idx = tableColumns.findIndex(c => c.id === id)
    if (idx !== -1) tableColumns.splice(idx, 1)
  }
}

export function queryTableColumns(body: any) {
  let filtered = [...tableColumns]

  if (body.whereQuery?.items) {
    for (const item of body.whereQuery.items) {
      if (item.value === null || item.value === undefined || item.value === '') continue
      const field = item.field as string
      const opr = item.opr as string
      const value = item.value

      filtered = filtered.filter((col) => {
        const fieldValue = getNestedValue(col, field)
        switch (opr) {
          case 'eq': return fieldValue === value
          case 'ne': return fieldValue !== value
          case 'in': return Array.isArray(value) ? value.includes(fieldValue) : fieldValue === value
          default: return true
        }
      })
    }
  }

  if (body.orderQuery && body.orderQuery.length > 0) {
    filtered.sort((a, b) => {
      for (const order of body.orderQuery) {
        const field = order.field as string
        const aVal = getNestedValue(a, field)
        const bVal = getNestedValue(b, field)
        if (aVal === bVal) continue
        const dir = order.order === 'desc' ? -1 : 1
        if (aVal == null) return dir
        if (bVal == null) return -dir
        return aVal < bVal ? -dir : dir
      }
      return 0
    })
  }

  const total = filtered.length
  const pageNum = body.pagination?.pageNum || 1
  const pageSize = body.pagination?.pageSize || 10

  if (pageSize > 0) {
    const start = (pageNum - 1) * pageSize
    filtered = filtered.slice(start, start + pageSize)
  }

  return {
    list: filtered,
    total,
    pageNum,
    pageSize: pageSize || total
  }
}

// ─── TablePermission mock data ─────────────────────────────────────────────────

const tablePermissions: MockTablePermission[] = [
  { id: 1, name: '超级管理员-用户表', tableId: 1, canView: true, canEdit: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 },
  { id: 2, name: '管理员-用户表', tableId: 1, canView: true, canEdit: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 },
  { id: 3, name: '普通用户-用户表', tableId: 1, canView: true, canEdit: false, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 },
  { id: 4, name: '超级管理员-角色表', tableId: 2, canView: true, canEdit: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 }
]

let nextTablePermissionId = 5

export function getTablePermissions() {
  return tablePermissions
}

export function getTablePermissionById(id: number) {
  return tablePermissions.find(p => p.id === id)
}

export function getTablePermissionsByTableId(tableId: number) {
  return tablePermissions.filter(p => p.tableId === tableId)
}

export function createTablePermission(data: Partial<MockTablePermission>): MockTablePermission {
  const now = new Date().toISOString()
  const perm: MockTablePermission = {
    id: nextTablePermissionId++,
    name: data.name || '',
    tableId: data.tableId || 0,
    canView: data.canView ?? false,
    canEdit: data.canEdit ?? false,
    columnPermissions: data.columnPermissions || [],
    createdAt: now,
    updatedAt: now,
    createdBy: 'playground',
    updatedBy: 'playground',
    version: 1
  }
  tablePermissions.push(perm)
  return perm
}

export function updateTablePermission(data: Partial<MockTablePermission>): MockTablePermission | null {
  const idx = tablePermissions.findIndex(p => p.id === data.id)
  if (idx === -1) return null
  const updated: MockTablePermission = {
    ...tablePermissions[idx]!,
    ...data,
    updatedAt: new Date().toISOString(),
    updatedBy: 'playground',
    version: tablePermissions[idx]!.version + 1
  }
  tablePermissions[idx] = updated
  return updated
}

export function deleteTablePermissions(ids: number[]): void {
  for (const id of ids) {
    const idx = tablePermissions.findIndex(p => p.id === id)
    if (idx !== -1) tablePermissions.splice(idx, 1)
  }
}

// ─── TableColumnPermission mock data ──────────────────────────────────────────

const tableColumnPermissions: MockTableColumnPermission[] = [
  { id: 1, tablePermissionId: 3, columnKey: 'id', canView: true, canEdit: false, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 },
  { id: 2, tablePermissionId: 3, columnKey: 'nickname', canView: true, canEdit: false, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 },
  { id: 3, tablePermissionId: 3, columnKey: 'email', canView: false, canEdit: false, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 }
]

let nextTableColumnPermissionId = 4

export function getTableColumnPermissions() {
  return tableColumnPermissions
}

export function getTableColumnPermissionsByTablePermissionId(tablePermissionId: number) {
  return tableColumnPermissions.filter(p => p.tablePermissionId === tablePermissionId)
}

export function createTableColumnPermission(data: Partial<MockTableColumnPermission>): MockTableColumnPermission {
  const now = new Date().toISOString()
  const colPerm: MockTableColumnPermission = {
    id: nextTableColumnPermissionId++,
    tablePermissionId: data.tablePermissionId || 0,
    columnKey: data.columnKey || '',
    canView: data.canView ?? false,
    canEdit: data.canEdit ?? false,
    createdAt: now,
    updatedAt: now,
    createdBy: 'playground',
    updatedBy: 'playground',
    version: 1
  }
  tableColumnPermissions.push(colPerm)
  return colPerm
}

export function updateTableColumnPermission(data: Partial<MockTableColumnPermission>): MockTableColumnPermission | null {
  const idx = tableColumnPermissions.findIndex(p => p.id === data.id)
  if (idx === -1) return null
  const updated: MockTableColumnPermission = {
    ...tableColumnPermissions[idx]!,
    ...data,
    updatedAt: new Date().toISOString(),
    updatedBy: 'playground',
    version: tableColumnPermissions[idx]!.version + 1
  }
  tableColumnPermissions[idx] = updated
  return updated
}

export function deleteTableColumnPermissions(ids: number[]): void {
  for (const id of ids) {
    const idx = tableColumnPermissions.findIndex(p => p.id === id)
    if (idx !== -1) tableColumnPermissions.splice(idx, 1)
  }
}

// ─── UserTableColumn mock data ──────────────────────────────────────────────────

const userTableColumns: MockUserTableColumn[] = [
  { id: 1, userId: 1, tableColumnId: 10, order: 10, width: 130, fixed: '', visible: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 },
  { id: 2, userId: 1, tableColumnId: 7, order: 7, width: 80, fixed: '', visible: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 }
]

let nextUserTableColumnId = 3

export function getUserTableColumns() {
  return userTableColumns
}

export function getUserTableColumnById(id: number) {
  return userTableColumns.find(c => c.id === id)
}

export function getUserTableColumnsByUserId(userId: number) {
  return userTableColumns.filter(c => c.userId === userId)
}

export function getUserTableColumnsByTableColumnIds(tableColumnIds: number[], userId: number) {
  return userTableColumns.filter(c => c.userId === userId && tableColumnIds.includes(c.tableColumnId))
}

export function createUserTableColumn(data: Partial<MockUserTableColumn>): MockUserTableColumn {
  const now = new Date().toISOString()
  const utc: MockUserTableColumn = {
    id: nextUserTableColumnId++,
    userId: data.userId || 0,
    tableColumnId: data.tableColumnId || 0,
    order: data.order,
    width: data.width,
    fixed: data.fixed,
    visible: data.visible,
    createdAt: now,
    updatedAt: now,
    createdBy: 'playground',
    updatedBy: 'playground',
    version: 1
  }
  userTableColumns.push(utc)
  return utc
}

export function updateUserTableColumn(data: Partial<MockUserTableColumn>): MockUserTableColumn | null {
  const idx = userTableColumns.findIndex(c => c.id === data.id)
  if (idx === -1) return null
  const updated: MockUserTableColumn = {
    ...userTableColumns[idx]!,
    ...data,
    updatedAt: new Date().toISOString(),
    updatedBy: 'playground',
    version: userTableColumns[idx]!.version + 1
  }
  userTableColumns[idx] = updated
  return updated
}

export function deleteUserTableColumns(ids: number[]): void {
  for (const id of ids) {
    const idx = userTableColumns.findIndex(c => c.id === id)
    if (idx !== -1) userTableColumns.splice(idx, 1)
  }
}

// Mock user data for the playground
export interface MockMenu {
  id: number
  isAdmin?: boolean
  type: string // 'catalog' | 'menu' | 'button'
  parentId?: number
  name?: string
  i18nKey?: string
  staticRouteKeys?: string[]
  permission?: string
  order?: string
  disabled?: boolean
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
  version: number
}

export interface MockRole {
  id: number
  name: string
  permission: string
  disabled: boolean
  remark?: string
  tablePermissions?: number[]
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
  version: number
}

export interface MockUser {
  id: number
  nickname: string
  username: string
  email: string
  gender: number
  departmentId: number
  department?: { id: number, name: string }
  isAdmin: boolean
  status: string
  entryDate: string
  resignDate?: string
  telNo?: string
  tablePermissions?: number[]
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
  version: number
}

export interface MockDepartment {
  id: number
  name: string
  parentId?: number
  createdAt: string
  updatedAt: string
  version: number
}

export interface MockFlowEdge {
  id: number
  flowId: number
  parentId?: number
  parentHandlePos?: string
  childId?: number
  childHandlePos?: string
  label?: string
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
  version: number
}

export interface MockFlowNode {
  id: number
  flowId: number
  name?: string
  positionX?: number
  positionY?: number
  width?: number
  height?: number
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
  version: number
}

export interface MockFlow {
  id: number
  name?: string
  description?: string
  nodes?: MockFlowNode[]
  edges?: MockFlowEdge[]
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
  version: number
}

const departments: MockDepartment[] = [
  { id: 1, name: '工程部', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', version: 1 },
  { id: 2, name: '产品部', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', version: 1 },
  { id: 3, name: '设计部', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', version: 1 },
  { id: 4, name: '市场部', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', version: 1 },
  { id: 5, name: '人力资源部', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', version: 1 },
  { id: 6, name: '财务部', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', version: 1 },
  { id: 7, name: '运营部', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', version: 1 },
  { id: 8, name: '销售部', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', version: 1 }
]

const flowNodes: MockFlowNode[] = [
  { id: 1001, flowId: 1, name: '发现风险', positionX: 80, positionY: 80, width: 180, height: 100, createdAt: '2025-03-01T08:00:00Z', updatedAt: '2025-03-01T08:00:00Z', createdBy: 'playground', updatedBy: 'playground', version: 1 },
  { id: 1002, flowId: 1, name: '评估影响', positionX: 360, positionY: 80, width: 180, height: 100, createdAt: '2025-03-01T08:00:00Z', updatedAt: '2025-03-01T08:00:00Z', createdBy: 'playground', updatedBy: 'playground', version: 1 },
  { id: 1003, flowId: 1, name: '制定方案', positionX: 640, positionY: 80, width: 180, height: 100, createdAt: '2025-03-01T08:00:00Z', updatedAt: '2025-03-01T08:00:00Z', createdBy: 'playground', updatedBy: 'playground', version: 1 },
  { id: 1004, flowId: 2, name: '提交申请', positionX: 80, positionY: 120, width: 180, height: 100, createdAt: '2025-03-05T08:00:00Z', updatedAt: '2025-03-05T08:00:00Z', createdBy: 'playground', updatedBy: 'playground', version: 1 },
  { id: 1005, flowId: 2, name: '部门审批', positionX: 360, positionY: 120, width: 180, height: 100, createdAt: '2025-03-05T08:00:00Z', updatedAt: '2025-03-05T08:00:00Z', createdBy: 'playground', updatedBy: 'playground', version: 1 },
  { id: 1006, flowId: 2, name: '财务复核', positionX: 640, positionY: 120, width: 180, height: 100, createdAt: '2025-03-05T08:00:00Z', updatedAt: '2025-03-05T08:00:00Z', createdBy: 'playground', updatedBy: 'playground', version: 1 }
]

const flowEdges: MockFlowEdge[] = [
  { id: 2001, flowId: 1, parentId: 1001, childId: 1002, parentHandlePos: 'r2', childHandlePos: 'l2', label: '进入评估', createdAt: '2025-03-01T08:00:00Z', updatedAt: '2025-03-01T08:00:00Z', createdBy: 'playground', updatedBy: 'playground', version: 1 },
  { id: 2002, flowId: 1, parentId: 1002, childId: 1003, parentHandlePos: 'r2', childHandlePos: 'l2', label: '输出方案', createdAt: '2025-03-01T08:00:00Z', updatedAt: '2025-03-01T08:00:00Z', createdBy: 'playground', updatedBy: 'playground', version: 1 },
  { id: 2003, flowId: 2, parentId: 1004, childId: 1005, parentHandlePos: 'r2', childHandlePos: 'l2', label: '主管审核', createdAt: '2025-03-05T08:00:00Z', updatedAt: '2025-03-05T08:00:00Z', createdBy: 'playground', updatedBy: 'playground', version: 1 },
  { id: 2004, flowId: 2, parentId: 1005, childId: 1006, parentHandlePos: 'r2', childHandlePos: 'l2', label: '进入复核', createdAt: '2025-03-05T08:00:00Z', updatedAt: '2025-03-05T08:00:00Z', createdBy: 'playground', updatedBy: 'playground', version: 1 }
]

const flows: MockFlow[] = [
  { id: 1, name: '风险预警流程', description: '用于演示风险识别到处置的主流程', createdAt: '2025-03-01T08:00:00Z', updatedAt: '2025-03-12T10:00:00Z', createdBy: 'playground', updatedBy: 'playground', version: 1 },
  { id: 2, name: '费用审批流程', description: '用于演示跨部门审批的标准流转', createdAt: '2025-03-05T08:00:00Z', updatedAt: '2025-03-15T11:30:00Z', createdBy: 'playground', updatedBy: 'playground', version: 1 }
]

let nextFlowId = 3
let nextFlowNodeId = 1007
let nextFlowEdgeId = 2005

const users: MockUser[] = [
  { id: 1, nickname: '张三', username: 'zhangsan', email: 'zhangsan@example.com', gender: 1, departmentId: 1, department: { id: 1, name: '工程部' }, isAdmin: true, status: 'active', entryDate: '2022-03-15', telNo: '13800001111', tablePermissions: [1, 4], createdAt: '2022-03-15T08:00:00Z', updatedAt: '2025-01-10T10:00:00Z', createdBy: 'system', updatedBy: 'admin', version: 5 },
  { id: 2, nickname: '李四', username: 'lisi', email: 'lisi@example.com', gender: 2, departmentId: 2, department: { id: 2, name: '产品部' }, isAdmin: false, status: 'active', entryDate: '2022-06-20', telNo: '13800002222', createdAt: '2022-06-20T08:00:00Z', updatedAt: '2025-02-15T14:30:00Z', createdBy: 'system', updatedBy: 'zhangsan', version: 3 },
  { id: 3, nickname: '王五', username: 'wangwu', email: 'wangwu@example.com', gender: 1, departmentId: 1, department: { id: 1, name: '工程部' }, isAdmin: false, status: 'active', entryDate: '2022-09-01', telNo: '13800003333', createdAt: '2022-09-01T08:00:00Z', updatedAt: '2025-03-20T09:15:00Z', createdBy: 'system', updatedBy: 'zhangsan', version: 2 },
  { id: 4, nickname: '赵六', username: 'zhaoliu', email: 'zhaoliu@example.com', gender: 2, departmentId: 3, department: { id: 3, name: '设计部' }, isAdmin: false, status: 'active', entryDate: '2023-01-10', telNo: '13800004444', createdAt: '2023-01-10T08:00:00Z', updatedAt: '2025-01-05T11:20:00Z', createdBy: 'zhangsan', updatedBy: 'zhangsan', version: 1 },
  { id: 5, nickname: '孙七', username: 'sunqi', email: 'sunqi@example.com', gender: 1, departmentId: 4, department: { id: 4, name: '市场部' }, isAdmin: false, status: 'active', entryDate: '2023-03-22', telNo: '13800005555', createdAt: '2023-03-22T08:00:00Z', updatedAt: '2025-02-28T16:45:00Z', createdBy: 'lisi', updatedBy: 'lisi', version: 2 },
  { id: 6, nickname: '周八', username: 'zhouba', email: 'zhouba@example.com', gender: 1, departmentId: 1, department: { id: 1, name: '工程部' }, isAdmin: false, status: 'inactive', entryDate: '2021-08-15', resignDate: '2024-12-31', telNo: '13800006666', createdAt: '2021-08-15T08:00:00Z', updatedAt: '2024-12-31T17:00:00Z', createdBy: 'system', updatedBy: 'admin', version: 4 },
  { id: 7, nickname: '吴九', username: 'wujiu', email: 'wujiu@example.com', gender: 2, departmentId: 5, department: { id: 5, name: '人力资源部' }, isAdmin: false, status: 'active', entryDate: '2023-07-01', telNo: '13800007777', createdAt: '2023-07-01T08:00:00Z', updatedAt: '2025-03-15T10:30:00Z', createdBy: 'zhangsan', updatedBy: 'zhangsan', version: 1 },
  { id: 8, nickname: '郑十', username: 'zhengshi', email: 'zhengshi@example.com', gender: 1, departmentId: 6, department: { id: 6, name: '财务部' }, isAdmin: false, status: 'active', entryDate: '2023-09-15', telNo: '13800008888', createdAt: '2023-09-15T08:00:00Z', updatedAt: '2025-01-20T13:00:00Z', createdBy: 'wujiu', updatedBy: 'wujiu', version: 1 },
  { id: 9, nickname: '钱十一', username: 'qianshiyi', email: 'qianshiyi@example.com', gender: 2, departmentId: 2, department: { id: 2, name: '产品部' }, isAdmin: false, status: 'active', entryDate: '2024-01-08', telNo: '13800009999', createdAt: '2024-01-08T08:00:00Z', updatedAt: '2025-03-01T15:20:00Z', createdBy: 'lisi', updatedBy: 'lisi', version: 1 },
  { id: 10, nickname: '陈十二', username: 'chenshier', email: 'chenshier@example.com', gender: 1, departmentId: 7, department: { id: 7, name: '运营部' }, isAdmin: false, status: 'active', entryDate: '2024-03-20', telNo: '13800010000', createdAt: '2024-03-20T08:00:00Z', updatedAt: '2025-02-10T09:45:00Z', createdBy: 'zhangsan', updatedBy: 'zhangsan', version: 1 },
  { id: 11, nickname: '林十三', username: 'linshisan', email: 'linshisan@example.com', gender: 2, departmentId: 3, department: { id: 3, name: '设计部' }, isAdmin: false, status: 'active', entryDate: '2024-05-15', telNo: '13800011111', createdAt: '2024-05-15T08:00:00Z', updatedAt: '2025-03-18T11:00:00Z', createdBy: 'zhaoliu', updatedBy: 'zhaoliu', version: 1 },
  { id: 12, nickname: '黄十四', username: 'huangshisi', email: 'huangshisi@example.com', gender: 1, departmentId: 8, department: { id: 8, name: '销售部' }, isAdmin: false, status: 'active', entryDate: '2024-07-01', telNo: '13800012222', createdAt: '2024-07-01T08:00:00Z', updatedAt: '2025-01-30T14:15:00Z', createdBy: 'sunqi', updatedBy: 'sunqi', version: 1 },
  { id: 13, nickname: '杨十五', username: 'yangshiwu', email: 'yangshiwu@example.com', gender: 1, departmentId: 1, department: { id: 1, name: '工程部' }, isAdmin: false, status: 'active', entryDate: '2024-09-10', telNo: '13800013333', createdAt: '2024-09-10T08:00:00Z', updatedAt: '2025-03-05T16:30:00Z', createdBy: 'wangwu', updatedBy: 'wangwu', version: 1 },
  { id: 14, nickname: '许十六', username: 'xushiliu', email: 'xushiliu@example.com', gender: 2, departmentId: 4, department: { id: 4, name: '市场部' }, isAdmin: false, status: 'inactive', entryDate: '2022-11-01', resignDate: '2025-02-28', telNo: '13800014444', createdAt: '2022-11-01T08:00:00Z', updatedAt: '2025-02-28T17:00:00Z', createdBy: 'system', updatedBy: 'admin', version: 3 },
  { id: 15, nickname: '何十七', username: 'heshiqi', email: 'heshiqi@example.com', gender: 1, departmentId: 5, department: { id: 5, name: '人力资源部' }, isAdmin: false, status: 'active', entryDate: '2025-01-06', telNo: '13800015555', createdAt: '2025-01-06T08:00:00Z', updatedAt: '2025-03-20T10:00:00Z', createdBy: 'wujiu', updatedBy: 'wujiu', version: 1 },
  { id: 16, nickname: '宋十八', username: 'songshiba', email: 'songshiba@example.com', gender: 2, departmentId: 2, department: { id: 2, name: '产品部' }, isAdmin: false, status: 'active', entryDate: '2025-02-17', telNo: '13800016666', createdAt: '2025-02-17T08:00:00Z', updatedAt: '2025-03-22T09:30:00Z', createdBy: 'qianshiyi', updatedBy: 'qianshiyi', version: 1 },
  { id: 17, nickname: '唐十九', username: 'tangshijiu', email: 'tangshijiu@example.com', gender: 1, departmentId: 6, department: { id: 6, name: '财务部' }, isAdmin: false, status: 'active', entryDate: '2025-03-01', telNo: '13800017777', createdAt: '2025-03-01T08:00:00Z', updatedAt: '2025-03-24T08:00:00Z', createdBy: 'zhengshi', updatedBy: 'zhengshi', version: 1 },
  { id: 18, nickname: '冯二十', username: 'fengershi', email: 'fengershi@example.com', gender: 2, departmentId: 7, department: { id: 7, name: '运营部' }, isAdmin: true, status: 'active', entryDate: '2021-05-20', telNo: '13800018888', createdAt: '2021-05-20T08:00:00Z', updatedAt: '2025-03-10T12:00:00Z', createdBy: 'system', updatedBy: 'admin', version: 6 },
  { id: 19, nickname: '曹廿一', username: 'caonianyi', email: 'caonianyi@example.com', gender: 1, departmentId: 8, department: { id: 8, name: '销售部' }, isAdmin: false, status: 'active', entryDate: '2024-11-11', telNo: '13800019999', createdAt: '2024-11-11T08:00:00Z', updatedAt: '2025-03-15T15:45:00Z', createdBy: 'huangshisi', updatedBy: 'huangshisi', version: 1 },
  { id: 20, nickname: '魏廿二', username: 'weinianer', email: 'weinianer@example.com', gender: 2, departmentId: 1, department: { id: 1, name: '工程部' }, isAdmin: false, status: 'active', entryDate: '2025-03-15', telNo: '13800020000', createdAt: '2025-03-15T08:00:00Z', updatedAt: '2025-03-24T08:00:00Z', createdBy: 'yangshiwu', updatedBy: 'yangshiwu', version: 1 },
  { id: 21, nickname: '蒋廿三', username: 'jiangniansan', email: 'jiangniansan@example.com', gender: 1, departmentId: 3, department: { id: 3, name: '设计部' }, isAdmin: false, status: 'active', entryDate: '2024-04-01', telNo: '13800021111', createdAt: '2024-04-01T08:00:00Z', updatedAt: '2025-02-20T11:30:00Z', createdBy: 'linshisan', updatedBy: 'linshisan', version: 1 },
  { id: 22, nickname: '沈廿四', username: 'shenniansi', email: 'shenniansi@example.com', gender: 2, departmentId: 4, department: { id: 4, name: '市场部' }, isAdmin: false, status: 'inactive', entryDate: '2023-02-14', resignDate: '2025-01-15', telNo: '13800022222', createdAt: '2023-02-14T08:00:00Z', updatedAt: '2025-01-15T17:00:00Z', createdBy: 'sunqi', updatedBy: 'admin', version: 2 },
  { id: 23, nickname: '韩廿五', username: 'hannianwu', email: 'hannianwu@example.com', gender: 1, departmentId: 5, department: { id: 5, name: '人力资源部' }, isAdmin: false, status: 'active', entryDate: '2024-08-20', telNo: '13800023333', createdAt: '2024-08-20T08:00:00Z', updatedAt: '2025-03-12T14:00:00Z', createdBy: 'heshiqi', updatedBy: 'heshiqi', version: 1 },
  { id: 24, nickname: '朱廿六', username: 'zhunianliu', email: 'zhunianliu@example.com', gender: 2, departmentId: 6, department: { id: 6, name: '财务部' }, isAdmin: false, status: 'active', entryDate: '2024-10-01', telNo: '13800024444', createdAt: '2024-10-01T08:00:00Z', updatedAt: '2025-03-18T10:15:00Z', createdBy: 'tangshijiu', updatedBy: 'tangshijiu', version: 1 },
  { id: 25, nickname: '秦廿七', username: 'qinnianqi', email: 'qinnianqi@example.com', gender: 1, departmentId: 8, department: { id: 8, name: '销售部' }, isAdmin: false, status: 'active', entryDate: '2025-01-20', telNo: '13800025555', createdAt: '2025-01-20T08:00:00Z', updatedAt: '2025-03-22T16:00:00Z', createdBy: 'caonianyi', updatedBy: 'caonianyi', version: 1 }
]

let nextId = 26

export function getUsers() {
  return users
}

export function getDepartments() {
  return departments
}

export function getUserById(id: number) {
  return users.find(u => u.id === id)
}

export function createUser(data: Partial<MockUser>): MockUser {
  const now = new Date().toISOString()
  const dept = departments.find(d => d.id === data.departmentId)
  const user: MockUser = {
    id: nextId++,
    nickname: data.nickname || '',
    username: data.username || '',
    email: data.email || '',
    gender: data.gender || 1,
    departmentId: data.departmentId || 1,
    department: dept ? { id: dept.id, name: dept.name } : undefined,
    isAdmin: data.isAdmin || false,
    status: data.status || 'active',
    entryDate: data.entryDate || now.split('T')[0]!,
    resignDate: data.resignDate,
    telNo: data.telNo,
    createdAt: now,
    updatedAt: now,
    createdBy: 'playground',
    updatedBy: 'playground',
    version: 1
  }
  users.push(user)
  return user
}

export function updateUser(data: Partial<MockUser>): MockUser | null {
  const idx = users.findIndex(u => u.id === data.id)
  if (idx === -1) return null
  const dept = departments.find(d => d.id === (data.departmentId || users[idx]!.departmentId))
  const updated = {
    ...users[idx]!,
    ...data,
    department: dept ? { id: dept.id, name: dept.name } : users[idx]!.department,
    updatedAt: new Date().toISOString(),
    updatedBy: 'playground',
    version: users[idx]!.version + 1
  }
  users[idx] = updated
  return updated
}

export function deleteUsers(ids: number[]): void {
  for (const id of ids) {
    const idx = users.findIndex(u => u.id === id)
    if (idx !== -1) users.splice(idx, 1)
  }
}

function attachFlowGraph(flow: MockFlow): MockFlow {
  return {
    ...flow,
    nodes: flowNodes.filter(node => node.flowId === flow.id),
    edges: flowEdges.filter(edge => edge.flowId === flow.id)
  }
}

export function getFlowById(id: number): MockFlow | undefined {
  const flow = flows.find(item => item.id === id)
  return flow ? attachFlowGraph(flow) : undefined
}

export function createFlow(data: Partial<MockFlow>): MockFlow {
  const now = new Date().toISOString()
  const flow: MockFlow = {
    id: nextFlowId++,
    name: data.name,
    description: data.description,
    createdAt: now,
    updatedAt: now,
    createdBy: 'playground',
    updatedBy: 'playground',
    version: 1
  }
  flows.push(flow)
  return attachFlowGraph(flow)
}

export function updateFlow(data: Partial<MockFlow>): MockFlow | null {
  const idx = flows.findIndex(item => item.id === data.id)
  if (idx === -1) return null
  const updated: MockFlow = {
    ...flows[idx]!,
    ...data,
    updatedAt: new Date().toISOString(),
    updatedBy: 'playground',
    version: flows[idx]!.version + 1
  }
  delete (updated as Partial<MockFlow>).nodes
  delete (updated as Partial<MockFlow>).edges
  flows[idx] = updated
  return attachFlowGraph(updated)
}

export function deleteFlows(ids: number[]): void {
  ids.forEach((id) => {
    const flowIdx = flows.findIndex(item => item.id === id)
    if (flowIdx !== -1) flows.splice(flowIdx, 1)

    for (let i = flowNodes.length - 1; i >= 0; i--) {
      if (flowNodes[i]!.flowId === id) flowNodes.splice(i, 1)
    }

    for (let i = flowEdges.length - 1; i >= 0; i--) {
      if (flowEdges[i]!.flowId === id) flowEdges.splice(i, 1)
    }
  })
}

export function queryFlows(body: any) {
  let filtered = flows.map(attachFlowGraph)

  if (body.whereQuery?.items) {
    for (const item of body.whereQuery.items) {
      if (item.value === null || item.value === undefined || item.value === '') continue
      const field = item.field as string
      const opr = item.opr as string
      const value = item.value

      filtered = filtered.filter((flow) => {
        const fieldValue = getNestedValue(flow, field)
        switch (opr) {
          case 'eq': return fieldValue === value
          case 'ne': return fieldValue !== value
          case 'like': return String(fieldValue ?? '').toLowerCase().includes(String(value).toLowerCase())
          case 'start_like': return String(fieldValue ?? '').toLowerCase().startsWith(String(value).toLowerCase())
          case 'in': return Array.isArray(value) ? value.includes(fieldValue) : fieldValue === value
          case 'not_in': return Array.isArray(value) ? !value.includes(fieldValue) : fieldValue !== value
          case 'gt': return (fieldValue as any) > value
          case 'gte': return (fieldValue as any) >= value
          case 'lt': return (fieldValue as any) < value
          case 'lte': return (fieldValue as any) <= value
          case 'is_null': return fieldValue === null || fieldValue === undefined
          case 'is_not_null': return fieldValue !== null && fieldValue !== undefined
          default: return true
        }
      })
    }
  }

  if (body.orderQuery && body.orderQuery.length > 0) {
    filtered.sort((a, b) => {
      for (const order of body.orderQuery) {
        const field = order.field as string
        const aVal = getNestedValue(a, field)
        const bVal = getNestedValue(b, field)
        if (aVal === bVal) continue
        const dir = order.order === 'desc' ? -1 : 1
        if (aVal == null) return dir
        if (bVal == null) return -dir
        return aVal < bVal ? -dir : dir
      }
      return 0
    })
  }

  const total = filtered.length
  const pageNum = body.pagination?.pageNum || 1
  const pageSize = body.pagination?.pageSize || 10

  if (pageSize > 0) {
    const start = (pageNum - 1) * pageSize
    filtered = filtered.slice(start, start + pageSize)
  }

  return {
    list: filtered,
    total,
    pageNum,
    pageSize: pageSize || total
  }
}

export function createFlowNode(data: Partial<MockFlowNode>): MockFlowNode {
  const now = new Date().toISOString()
  const node: MockFlowNode = {
    id: nextFlowNodeId++,
    flowId: data.flowId || 0,
    name: data.name || `节点 ${nextFlowNodeId - 1}`,
    positionX: data.positionX ?? 0,
    positionY: data.positionY ?? 0,
    width: data.width ?? 120,
    height: data.height ?? 40,
    createdAt: now,
    updatedAt: now,
    createdBy: 'playground',
    updatedBy: 'playground',
    version: 1
  }
  flowNodes.push(node)
  return node
}

export function updateFlowNode(data: Partial<MockFlowNode>): MockFlowNode | null {
  const idx = flowNodes.findIndex(item => item.id === data.id)
  if (idx === -1) return null
  const updated: MockFlowNode = {
    ...flowNodes[idx]!,
    ...data,
    updatedAt: new Date().toISOString(),
    updatedBy: 'playground',
    version: flowNodes[idx]!.version + 1
  }
  flowNodes[idx] = updated
  return updated
}

export function deleteFlowNodes(ids: number[]): void {
  ids.forEach((id) => {
    const idx = flowNodes.findIndex(item => item.id === id)
    if (idx !== -1) flowNodes.splice(idx, 1)

    for (let i = flowEdges.length - 1; i >= 0; i--) {
      if (flowEdges[i]!.parentId === id || flowEdges[i]!.childId === id) flowEdges.splice(i, 1)
    }
  })
}

export function createFlowEdge(data: Partial<MockFlowEdge>): MockFlowEdge {
  const now = new Date().toISOString()
  const edge: MockFlowEdge = {
    id: nextFlowEdgeId++,
    flowId: data.flowId || 0,
    parentId: data.parentId,
    parentHandlePos: data.parentHandlePos,
    childId: data.childId,
    childHandlePos: data.childHandlePos,
    label: data.label,
    createdAt: now,
    updatedAt: now,
    createdBy: 'playground',
    updatedBy: 'playground',
    version: 1
  }
  flowEdges.push(edge)
  return edge
}

export function updateFlowEdge(data: Partial<MockFlowEdge>): MockFlowEdge | null {
  const idx = flowEdges.findIndex(item => item.id === data.id)
  if (idx === -1) return null
  const updated: MockFlowEdge = {
    ...flowEdges[idx]!,
    ...data,
    updatedAt: new Date().toISOString(),
    updatedBy: 'playground',
    version: flowEdges[idx]!.version + 1
  }
  flowEdges[idx] = updated
  return updated
}

export function deleteFlowEdges(ids: number[]): void {
  ids.forEach((id) => {
    const idx = flowEdges.findIndex(item => item.id === id)
    if (idx !== -1) flowEdges.splice(idx, 1)
  })
}

// Query engine for mock data
export function queryUsers(body: any) {
  let filtered = [...users]

  // Apply where query
  if (body.whereQuery?.items) {
    for (const item of body.whereQuery.items) {
      if (item.value === null || item.value === undefined || item.value === '') continue
      const field = item.field as string
      const opr = item.opr as string
      const value = item.value

      filtered = filtered.filter((user) => {
        const fieldValue = getNestedValue(user, field)
        switch (opr) {
          case 'eq': return fieldValue === value
          case 'ne': return fieldValue !== value
          case 'like': return String(fieldValue ?? '').toLowerCase().includes(String(value).toLowerCase())
          case 'start_like': return String(fieldValue ?? '').toLowerCase().startsWith(String(value).toLowerCase())
          case 'in': return Array.isArray(value) ? value.includes(fieldValue) : fieldValue === value
          case 'not_in': return Array.isArray(value) ? !value.includes(fieldValue) : fieldValue !== value
          case 'gt': return (fieldValue as any) > value
          case 'gte': return (fieldValue as any) >= value
          case 'lt': return (fieldValue as any) < value
          case 'lte': return (fieldValue as any) <= value
          case 'is_null': return fieldValue === null || fieldValue === undefined
          case 'is_not_null': return fieldValue !== null && fieldValue !== undefined
          case 'range_gte_lte':
            if (value.start && value.end) return fieldValue! >= value.start && fieldValue! <= value.end
            if (value.start) return fieldValue! >= value.start
            if (value.end) return fieldValue! <= value.end
            return true
          case 'range_gte_lt':
            if (value.start && value.end) return fieldValue! >= value.start && fieldValue! < value.end
            if (value.start) return fieldValue! >= value.start
            if (value.end) return fieldValue! < value.end
            return true
          default: return true
        }
      })
    }
  }

  // Apply order query
  if (body.orderQuery && body.orderQuery.length > 0) {
    filtered.sort((a, b) => {
      for (const order of body.orderQuery) {
        const field = order.field as string
        const aVal = getNestedValue(a, field)
        const bVal = getNestedValue(b, field)
        if (aVal === bVal) continue
        const dir = order.order === 'desc' ? -1 : 1
        if (aVal == null) return dir
        if (bVal == null) return -dir
        return aVal < bVal ? -dir : dir
      }
      return 0
    })
  }

  // Pagination
  const total = filtered.length
  const pageNum = body.pagination?.pageNum || 1
  const pageSize = body.pagination?.pageSize || 10

  if (pageSize > 0) {
    const start = (pageNum - 1) * pageSize
    filtered = filtered.slice(start, start + pageSize)
  }

  return {
    list: filtered,
    total,
    pageNum,
    pageSize: pageSize || total
  }
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((o, k) => o?.[k], obj)
}

// ─── Menu mock data ───────────────────────────────────────────────────────────

const menus: MockMenu[] = [
  // ── 系统管理 (catalog, id=1) ──────────────────────────────────────────────
  { id: 1, type: 'catalog', parentId: 0, name: '系统管理', i18nKey: 'menu.sys', order: '1', disabled: false, createdAt: '2022-01-01T00:00:00Z', updatedAt: '2022-01-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 },
  { id: 2, type: 'menu', parentId: 1, name: '用户管理', i18nKey: 'menu.sys.user', staticRouteKeys: ['/sys/users'], permission: 'sys:user:view', order: '1', disabled: false, createdAt: '2022-01-01T00:00:00Z', updatedAt: '2022-01-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 },
  { id: 3, type: 'button', parentId: 2, name: '新增用户', i18nKey: 'menu.sys.user.create', permission: 'sys:user:create', order: '1', disabled: false, createdAt: '2022-01-01T00:00:00Z', updatedAt: '2022-01-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 },
  { id: 4, type: 'button', parentId: 2, name: '编辑用户', i18nKey: 'menu.sys.user.update', permission: 'sys:user:update', order: '2', disabled: false, createdAt: '2022-01-01T00:00:00Z', updatedAt: '2022-01-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 },
  { id: 5, type: 'button', parentId: 2, name: '删除用户', i18nKey: 'menu.sys.user.delete', permission: 'sys:user:delete', order: '3', disabled: false, createdAt: '2022-01-01T00:00:00Z', updatedAt: '2022-01-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 },
  { id: 6, type: 'menu', parentId: 1, name: '角色管理', i18nKey: 'menu.sys.role', staticRouteKeys: ['/sys/roles'], permission: 'sys:role:view', order: '2', disabled: false, createdAt: '2022-01-01T00:00:00Z', updatedAt: '2022-01-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 },
  { id: 7, type: 'button', parentId: 6, name: '新增角色', i18nKey: 'menu.sys.role.create', permission: 'sys:role:create', order: '1', disabled: false, createdAt: '2022-01-01T00:00:00Z', updatedAt: '2022-01-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 },
  { id: 8, type: 'button', parentId: 6, name: '编辑角色', i18nKey: 'menu.sys.role.update', permission: 'sys:role:update', order: '2', disabled: false, createdAt: '2022-01-01T00:00:00Z', updatedAt: '2022-01-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 },
  { id: 9, type: 'button', parentId: 6, name: '删除角色', i18nKey: 'menu.sys.role.delete', permission: 'sys:role:delete', order: '3', disabled: false, createdAt: '2022-01-01T00:00:00Z', updatedAt: '2022-01-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 },
  { id: 10, type: 'menu', parentId: 1, name: '菜单管理', i18nKey: 'menu.sys.menu', staticRouteKeys: ['/sys/menus'], permission: 'sys:menu:view', order: '3', disabled: false, createdAt: '2022-01-01T00:00:00Z', updatedAt: '2022-01-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 },
  { id: 11, type: 'button', parentId: 10, name: '新增菜单', i18nKey: 'menu.sys.menu.create', permission: 'sys:menu:create', order: '1', disabled: false, createdAt: '2022-01-01T00:00:00Z', updatedAt: '2022-01-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 },
  { id: 12, type: 'button', parentId: 10, name: '编辑菜单', i18nKey: 'menu.sys.menu.update', permission: 'sys:menu:update', order: '2', disabled: false, createdAt: '2022-01-01T00:00:00Z', updatedAt: '2022-01-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 },
  { id: 13, type: 'button', parentId: 10, name: '删除菜单', i18nKey: 'menu.sys.menu.delete', permission: 'sys:menu:delete', order: '3', disabled: false, createdAt: '2022-01-01T00:00:00Z', updatedAt: '2022-01-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 },
  { id: 14, type: 'menu', parentId: 1, name: '部门管理', i18nKey: 'menu.sys.dept', staticRouteKeys: ['/sys/departments'], permission: 'sys:dept:view', order: '4', disabled: false, createdAt: '2022-01-01T00:00:00Z', updatedAt: '2022-01-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 },
  { id: 15, type: 'button', parentId: 14, name: '新增部门', i18nKey: 'menu.sys.dept.create', permission: 'sys:dept:create', order: '1', disabled: false, createdAt: '2022-01-01T00:00:00Z', updatedAt: '2022-01-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 },
  { id: 16, type: 'button', parentId: 14, name: '编辑部门', i18nKey: 'menu.sys.dept.update', permission: 'sys:dept:update', order: '2', disabled: false, createdAt: '2022-01-01T00:00:00Z', updatedAt: '2022-01-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 },
  { id: 17, type: 'button', parentId: 14, name: '删除部门', i18nKey: 'menu.sys.dept.delete', permission: 'sys:dept:delete', order: '3', disabled: false, createdAt: '2022-01-01T00:00:00Z', updatedAt: '2022-01-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 },

  // ── 运营管理 (catalog, id=18) ─────────────────────────────────────────────
  { id: 18, type: 'catalog', parentId: 0, name: '运营管理', i18nKey: 'menu.ops', order: '2', disabled: false, createdAt: '2022-06-01T00:00:00Z', updatedAt: '2022-06-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 },
  { id: 19, type: 'menu', parentId: 18, name: '公告管理', i18nKey: 'menu.ops.notice', staticRouteKeys: ['/ops/notices'], permission: 'ops:notice:view', order: '1', disabled: false, createdAt: '2022-06-01T00:00:00Z', updatedAt: '2022-06-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 },
  { id: 20, type: 'button', parentId: 19, name: '发布公告', i18nKey: 'menu.ops.notice.create', permission: 'ops:notice:create', order: '1', disabled: false, createdAt: '2022-06-01T00:00:00Z', updatedAt: '2022-06-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 },
  { id: 21, type: 'button', parentId: 19, name: '删除公告', i18nKey: 'menu.ops.notice.delete', permission: 'ops:notice:delete', order: '2', disabled: false, createdAt: '2022-06-01T00:00:00Z', updatedAt: '2022-06-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 },
  { id: 22, type: 'menu', parentId: 18, name: '日志管理', i18nKey: 'menu.ops.log', staticRouteKeys: ['/ops/logs'], permission: 'ops:log:view', order: '2', disabled: false, createdAt: '2022-06-01T00:00:00Z', updatedAt: '2022-06-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 },
  { id: 23, type: 'button', parentId: 22, name: '清空日志', i18nKey: 'menu.ops.log.clear', permission: 'ops:log:delete', order: '1', disabled: false, createdAt: '2022-06-01T00:00:00Z', updatedAt: '2022-06-01T00:00:00Z', createdBy: 'system', updatedBy: 'system', version: 1 },

  // ── 财务管理 (catalog, id=24) ─────────────────────────────────────────────
  { id: 24, type: 'catalog', parentId: 0, name: '财务管理', i18nKey: 'menu.finance', order: '3', disabled: false, createdAt: '2023-01-01T00:00:00Z', updatedAt: '2023-01-01T00:00:00Z', createdBy: 'zhangsan', updatedBy: 'zhangsan', version: 1 },
  { id: 25, type: 'menu', parentId: 24, name: '报销管理', i18nKey: 'menu.finance.expense', staticRouteKeys: ['/finance/expenses'], permission: 'finance:expense:view', order: '1', disabled: false, createdAt: '2023-01-01T00:00:00Z', updatedAt: '2023-01-01T00:00:00Z', createdBy: 'zhangsan', updatedBy: 'zhangsan', version: 1 },
  { id: 26, type: 'button', parentId: 25, name: '提交报销', i18nKey: 'menu.finance.expense.create', permission: 'finance:expense:create', order: '1', disabled: false, createdAt: '2023-01-01T00:00:00Z', updatedAt: '2023-01-01T00:00:00Z', createdBy: 'zhangsan', updatedBy: 'zhangsan', version: 1 },
  { id: 27, type: 'button', parentId: 25, name: '审批报销', i18nKey: 'menu.finance.expense.approve', permission: 'finance:expense:approve', order: '2', disabled: false, createdAt: '2023-01-01T00:00:00Z', updatedAt: '2023-01-01T00:00:00Z', createdBy: 'zhangsan', updatedBy: 'zhangsan', version: 1 },
  { id: 28, type: 'menu', parentId: 24, name: '预算管理', i18nKey: 'menu.finance.budget', staticRouteKeys: ['/finance/budgets'], permission: 'finance:budget:view', order: '2', disabled: false, createdAt: '2023-01-01T00:00:00Z', updatedAt: '2023-01-01T00:00:00Z', createdBy: 'zhangsan', updatedBy: 'zhangsan', version: 1 },
  { id: 29, type: 'button', parentId: 28, name: '新增预算', i18nKey: 'menu.finance.budget.create', permission: 'finance:budget:create', order: '1', disabled: false, createdAt: '2023-01-01T00:00:00Z', updatedAt: '2023-01-01T00:00:00Z', createdBy: 'zhangsan', updatedBy: 'zhangsan', version: 1 },

  // ── 已停用目录 (catalog, id=30) ───────────────────────────────────────────
  { id: 30, type: 'catalog', parentId: 0, name: '旧版功能', i18nKey: 'menu.legacy', order: '99', disabled: true, createdAt: '2021-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z', createdBy: 'system', updatedBy: 'admin', version: 2 },
  { id: 31, type: 'menu', parentId: 30, name: '旧版报表', i18nKey: 'menu.legacy.report', staticRouteKeys: ['/legacy/reports'], permission: 'legacy:report:view', order: '1', disabled: true, createdAt: '2021-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z', createdBy: 'system', updatedBy: 'admin', version: 2 }
]

let nextMenuId = 32

export function getMenus() {
  return menus
}

export function getMenuById(id: number) {
  return menus.find(m => m.id === id)
}

export function createMenu(data: Partial<MockMenu>): MockMenu {
  const now = new Date().toISOString()
  const menu: MockMenu = {
    id: nextMenuId++,
    type: data.type || 'menu',
    parentId: data.parentId,
    name: data.name,
    i18nKey: data.i18nKey,
    staticRouteKeys: data.staticRouteKeys,
    permission: data.permission,
    order: data.order,
    isAdmin: data.isAdmin,
    disabled: data.disabled ?? false,
    createdAt: now,
    updatedAt: now,
    createdBy: 'playground',
    updatedBy: 'playground',
    version: 1
  }
  menus.push(menu)
  return menu
}

export function updateMenu(data: Partial<MockMenu>): MockMenu | null {
  const idx = menus.findIndex(m => m.id === data.id)
  if (idx === -1) return null
  const updated: MockMenu = {
    ...menus[idx]!,
    ...data,
    updatedAt: new Date().toISOString(),
    updatedBy: 'playground',
    version: menus[idx]!.version + 1
  }
  menus[idx] = updated
  return updated
}

export function deleteMenus(ids: number[]): void {
  for (const id of ids) {
    const idx = menus.findIndex(m => m.id === id)
    if (idx !== -1) menus.splice(idx, 1)
  }
}

export function queryMenus(body: any) {
  let filtered = [...menus]

  if (body.whereQuery?.items) {
    for (const item of body.whereQuery.items) {
      if (item.value === null || item.value === undefined || item.value === '') continue
      const field = item.field as string
      const opr = item.opr as string
      const value = item.value

      filtered = filtered.filter((menu) => {
        const fieldValue = getNestedValue(menu, field)
        switch (opr) {
          case 'eq': return fieldValue === value
          case 'ne': return fieldValue !== value
          case 'like': return String(fieldValue ?? '').toLowerCase().includes(String(value).toLowerCase())
          case 'start_like': return String(fieldValue ?? '').toLowerCase().startsWith(String(value).toLowerCase())
          case 'in': return Array.isArray(value) ? value.includes(fieldValue) : fieldValue === value
          case 'not_in': return Array.isArray(value) ? !value.includes(fieldValue) : fieldValue !== value
          case 'gt': return (fieldValue as any) > value
          case 'gte': return (fieldValue as any) >= value
          case 'lt': return (fieldValue as any) < value
          case 'lte': return (fieldValue as any) <= value
          case 'is_null': return fieldValue === null || fieldValue === undefined
          case 'is_not_null': return fieldValue !== null && fieldValue !== undefined
          default: return true
        }
      })
    }
  }

  if (body.orderQuery && body.orderQuery.length > 0) {
    filtered.sort((a, b) => {
      for (const order of body.orderQuery) {
        const field = order.field as string
        const aVal = getNestedValue(a, field)
        const bVal = getNestedValue(b, field)
        if (aVal === bVal) continue
        const dir = order.order === 'desc' ? -1 : 1
        if (aVal == null) return dir
        if (bVal == null) return -dir
        return aVal < bVal ? -dir : dir
      }
      return 0
    })
  }

  const total = filtered.length
  const pageNum = body.pagination?.pageNum || 1
  const pageSize = body.pagination?.pageSize

  if (pageSize > 0) {
    const start = (pageNum - 1) * pageSize
    filtered = filtered.slice(start, start + pageSize)
  }

  return {
    list: filtered,
    total,
    pageNum,
    pageSize: pageSize || total
  }
}

// ─── Role mock data ───────────────────────────────────────────────────────────

const roles: MockRole[] = [
  { id: 1, name: '超级管理员', permission: 'super_admin', disabled: false, remark: '拥有所有权限', tablePermissions: [1, 4], createdAt: '2022-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z', createdBy: 'system', updatedBy: 'admin', version: 3 },
  { id: 2, name: '系统管理员', permission: 'sys_admin', disabled: false, remark: '负责系统配置与用户管理', tablePermissions: [2], createdAt: '2022-01-01T00:00:00Z', updatedAt: '2025-02-10T08:30:00Z', createdBy: 'system', updatedBy: 'zhangsan', version: 2 },
  { id: 3, name: '运营管理员', permission: 'ops_admin', disabled: false, remark: '负责日常运营管理', createdAt: '2022-03-15T00:00:00Z', updatedAt: '2025-03-01T10:00:00Z', createdBy: 'zhangsan', updatedBy: 'fengershi', version: 2 },
  { id: 4, name: '财务管理员', permission: 'finance_admin', disabled: false, remark: '负责财务审批与报表', createdAt: '2022-06-01T00:00:00Z', updatedAt: '2024-12-15T09:00:00Z', createdBy: 'zhangsan', updatedBy: 'zhangsan', version: 1 },
  { id: 5, name: '人事管理员', permission: 'hr_admin', disabled: false, remark: '负责人员招聘与绩效管理', createdAt: '2022-06-01T00:00:00Z', updatedAt: '2025-01-20T11:00:00Z', createdBy: 'zhangsan', updatedBy: 'wujiu', version: 1 },
  { id: 6, name: '产品经理', permission: 'product_manager', disabled: false, remark: '负责产品规划与需求管理', createdAt: '2023-01-01T00:00:00Z', updatedAt: '2025-02-18T14:00:00Z', createdBy: 'lisi', updatedBy: 'lisi', version: 1 },
  { id: 7, name: '工程师', permission: 'engineer', disabled: false, remark: '负责产品研发与技术实现', createdAt: '2023-01-01T00:00:00Z', updatedAt: '2025-03-10T09:30:00Z', createdBy: 'zhangsan', updatedBy: 'wangwu', version: 2 },
  { id: 8, name: '设计师', permission: 'designer', disabled: false, remark: '负责产品 UI/UX 设计', createdAt: '2023-03-01T00:00:00Z', updatedAt: '2025-01-08T10:15:00Z', createdBy: 'zhaoliu', updatedBy: 'zhaoliu', version: 1 },
  { id: 9, name: '市场专员', permission: 'marketing_staff', disabled: false, remark: '负责市场推广与品牌宣传', createdAt: '2023-04-01T00:00:00Z', updatedAt: '2025-02-22T13:00:00Z', createdBy: 'sunqi', updatedBy: 'sunqi', version: 1 },
  { id: 10, name: '销售专员', permission: 'sales_staff', disabled: false, remark: '负责客户开发与销售跟进', createdAt: '2023-05-01T00:00:00Z', updatedAt: '2025-03-05T15:30:00Z', createdBy: 'huangshisi', updatedBy: 'caonianyi', version: 1 },
  { id: 11, name: '访客', permission: 'guest', disabled: false, remark: '只读访问权限', tablePermissions: [3], createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-01T00:00:00Z', createdBy: 'zhangsan', updatedBy: 'zhangsan', version: 1 },
  { id: 12, name: '已停用角色', permission: 'deprecated_role', disabled: true, remark: '该角色已停用，请勿分配', createdAt: '2022-09-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z', createdBy: 'system', updatedBy: 'admin', version: 4 }
]

let nextRoleId = 13

export function getRoles() {
  return roles
}

export function getRoleById(id: number) {
  return roles.find(r => r.id === id)
}

export function createRole(data: Partial<MockRole>): MockRole {
  const now = new Date().toISOString()
  const role: MockRole = {
    id: nextRoleId++,
    name: data.name || '',
    permission: data.permission || '',
    disabled: data.disabled ?? false,
    remark: data.remark,
    createdAt: now,
    updatedAt: now,
    createdBy: 'playground',
    updatedBy: 'playground',
    version: 1
  }
  roles.push(role)
  return role
}

export function updateRole(data: Partial<MockRole>): MockRole | null {
  const idx = roles.findIndex(r => r.id === data.id)
  if (idx === -1) return null
  const updated: MockRole = {
    ...roles[idx]!,
    ...data,
    updatedAt: new Date().toISOString(),
    updatedBy: 'playground',
    version: roles[idx]!.version + 1
  }
  roles[idx] = updated
  return updated
}

export function deleteRoles(ids: number[]): void {
  for (const id of ids) {
    const idx = roles.findIndex(r => r.id === id)
    if (idx !== -1) roles.splice(idx, 1)
  }
}

export function queryRoles(body: any) {
  let filtered = [...roles]

  if (body.whereQuery?.items) {
    for (const item of body.whereQuery.items) {
      if (item.value === null || item.value === undefined || item.value === '') continue
      const field = item.field as string
      const opr = item.opr as string
      const value = item.value

      filtered = filtered.filter((role) => {
        const fieldValue = getNestedValue(role, field)
        switch (opr) {
          case 'eq': return fieldValue === value
          case 'ne': return fieldValue !== value
          case 'like': return String(fieldValue ?? '').toLowerCase().includes(String(value).toLowerCase())
          case 'start_like': return String(fieldValue ?? '').toLowerCase().startsWith(String(value).toLowerCase())
          case 'in': return Array.isArray(value) ? value.includes(fieldValue) : fieldValue === value
          case 'not_in': return Array.isArray(value) ? !value.includes(fieldValue) : fieldValue !== value
          case 'gt': return (fieldValue as any) > value
          case 'gte': return (fieldValue as any) >= value
          case 'lt': return (fieldValue as any) < value
          case 'lte': return (fieldValue as any) <= value
          case 'is_null': return fieldValue === null || fieldValue === undefined
          case 'is_not_null': return fieldValue !== null && fieldValue !== undefined
          default: return true
        }
      })
    }
  }

  if (body.orderQuery && body.orderQuery.length > 0) {
    filtered.sort((a, b) => {
      for (const order of body.orderQuery) {
        const field = order.field as string
        const aVal = getNestedValue(a, field)
        const bVal = getNestedValue(b, field)
        if (aVal === bVal) continue
        const dir = order.order === 'desc' ? -1 : 1
        if (aVal == null) return dir
        if (bVal == null) return -dir
        return aVal < bVal ? -dir : dir
      }
      return 0
    })
  }

  const total = filtered.length
  const pageNum = body.pagination?.pageNum || 1
  const pageSize = body.pagination?.pageSize || 10

  if (pageSize > 0) {
    const start = (pageNum - 1) * pageSize
    filtered = filtered.slice(start, start + pageSize)
  }

  return {
    list: filtered,
    total,
    pageNum,
    pageSize: pageSize || total
  }
}

export function enrichRoleWithTablePermissions(role: MockRole): MockRole & { tablePermissions: MockTablePermission[] } {
  const permIds = role.tablePermissions || []
  const perms = (permIds as number[])
    .map(id => getTablePermissionById(id))
    .filter(Boolean) as MockTablePermission[]

  const enrichedPerms = perms.map(p => ({
    ...p,
    columnPermissions: getTableColumnPermissionsByTablePermissionId(p.id)
  }))

  return { ...role, tablePermissions: enrichedPerms } as any
}

export function enrichUserWithTablePermissions(user: MockUser): MockUser & { tablePermissions: MockTablePermission[] } {
  const permIds = user.tablePermissions || []
  const perms = (permIds as number[])
    .map(id => getTablePermissionById(id))
    .filter(Boolean) as MockTablePermission[]

  const enrichedPerms = perms.map(p => ({
    ...p,
    columnPermissions: getTableColumnPermissionsByTablePermissionId(p.id)
  }))

  return { ...user, tablePermissions: enrichedPerms } as any
}

export function saveRoleTablePermissions(roleId: number, permissions: any[]): void {
  const role = getRoleById(roleId)
  if (!role) return
  role.tablePermissions = permissions.map(p => typeof p === 'number' ? p : p.id).filter(id => id > 0)
}

export function saveUserTablePermissions(userId: number, permissions: any[]): void {
  const user = getUserById(userId)
  if (!user) return
  user.tablePermissions = permissions.map(p => typeof p === 'number' ? p : p.id).filter(id => id > 0)
}
