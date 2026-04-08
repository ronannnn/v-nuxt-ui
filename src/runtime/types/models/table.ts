import type { BaseModel } from './base'

export interface Table extends BaseModel {
  tblName: string
  label: string
  labelI18nKey?: string
}

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

export interface UserTableColumn extends BaseModel {
  userId: number
  tableColumnId: number
  order?: number
  width?: number
  fixed?: 'left' | 'right' | ''
  visible?: boolean
}

export interface MergedTableColumn {
  tableColumnId?: number
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

export interface TablePermission extends BaseModel {
  name: string
  tableId: number
  canView?: boolean
  canEdit?: boolean
  columnPermissions?: TableColumnPermission[]
}

export interface TableColumnPermission extends BaseModel {
  tablePermissionId: number
  columnKey: string
  canView?: boolean
  canEdit?: boolean
}

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
