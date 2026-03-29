import type { Ref, VNode } from 'vue'
import type { BatchOprCommand, BatchSaveCommand, PageResult, RequestResult } from '../../request'
import type { QueryTemplate, WhereQuery } from '../../query'
import type { VColumn } from './column'
import type { TableHeaderProps } from './header'
import type { OrderQueryOption, WhereQueryOption } from './query'
import type { ButtonProps, DropdownMenuItem } from '@nuxt/ui'

/** Nuxt's UseFetchOptions type — redeclared locally to avoid #app import in library types */
type UseFetchOptions<T> = Record<string, any>

export * from './header'
export * from './pagination'
export * from './query'
export * from './column'

export type CountApi<T> = (payload: Omit<QueryTemplate<T>, 'selectQuery'>, customOptions?: UseFetchOptions<number>) => Promise<{ data: Ref<RequestResult<number>> }>
export type ListApi<T> = (payload: Omit<QueryTemplate<T>, 'selectQuery'>, customOptions?: UseFetchOptions<PageResult<T>>) => Promise<{ data: Ref<RequestResult<PageResult<T>>> }>
export type ApiGroup<T> = {
  create: (model: T, customOptions?: UseFetchOptions<T>) => Promise<{ data: Ref<RequestResult<T>> }>
  batchCreate: (cmd: BatchSaveCommand<T>, customOptions?: UseFetchOptions<T[]>) => Promise<{ data: Ref<RequestResult<T[]>> }>
  update: (model: T, customOptions?: UseFetchOptions<T>) => Promise<{ data: Ref<RequestResult<T>> }>
  batchUpdate: (cmd: BatchSaveCommand<T>, customOptions?: UseFetchOptions<T[]>) => Promise<{ data: Ref<RequestResult<T[]>> }>
  getById: (id: number, customOptions?: UseFetchOptions<T>) => Promise<{ data: Ref<RequestResult<T>> }>
  deleteById: (id: number, customOptions?: UseFetchOptions<void>) => Promise<{ data: Ref<RequestResult<void>> }>
  batchDelete: (delReq: BatchOprCommand, customOptions?: UseFetchOptions<void>) => Promise<{ data: Ref<RequestResult<void>> }>
  count: CountApi<T>
  list: ListApi<T>
  countAndList: ListApi<T>
  prune: (model: T) => T
  copy?: (model: T) => T
}

export type RowActionProps<T> = {
  label?: string
  icon?: string
  type?: DropdownMenuItem['type']
  color?: ButtonProps['color']
  fn?: (model: T) => void
  refetchAfterFn?: boolean
  fnWithModal?: (model: T) => Promise<boolean>
  asyncFn?: (model: T) => Promise<void>
}

export type VTableExportExcelProps<T> = {
  filename: string
  filenameWithDateTime?: boolean
  permissionKey?: string
  extraWhereQueryInitValues?: WhereQuery<T>
}

export type VTableProps<T> = {
  name: string
  cnName: string
  disableCreation?: boolean
  disableRefresh?: boolean
  disableBatchDeletion?: boolean
  disableSettings?: boolean
  disablePagination?: boolean
  disableFetchOnMounted?: boolean
  useApiGroup?: () => ApiGroup<T>
  apiListFn?: ListApi<T>
  fetchAll?: boolean
  onEditRowFromModal?: (row: T) => Promise<boolean>
  singleColumn?: boolean
  hideLastRowBorder?: boolean
  singleRow?: boolean
  exportExcel?: VTableExportExcelProps<T>
  extraButtons?: TableHeaderProps<T>['extraButtons']
  onNew?: TableHeaderProps<T>['onNew']
  disableWhereQuery?: TableHeaderProps<T>['disableWhereQuery']
  whereQueryOpen?: boolean
  onUpdateWhereQueryOpen?: (open: boolean) => void
  extraWhereQueryOptions?: WhereQueryOption<T>[]
  extraWhereQueryInitValues?: WhereQuery<T>
  disableOrderQuery?: TableHeaderProps<T>['disableOrderQuery']
  extraOrderQueryOptions?: OrderQueryOption<T>[]
  bizColumns: VColumn<T>[]
  extraRowActions?: RowActionProps<T>[]
  treeifyColName?: keyof T
  commonColumnProps?: VColumn<T>
  rowKey?: keyof T
  disableRowActions?: boolean
  disableRowUpdate?: boolean
  disableRowCopy?: boolean
  disableRowDeletion?: boolean
  disableRowSelection?: boolean
  expandable?: boolean
  expandVNode?: (row: T) => VNode
  rowSpanColumns?: (keyof T)[]
  customRowCopyFn?: (model: T) => T
}
