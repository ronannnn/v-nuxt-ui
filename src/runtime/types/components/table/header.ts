import type { ButtonProps } from '@nuxt/ui'
import type { ApiGroup, OrderQueryProps, VColumn, VTableExportExcelProps, WhereQueryProps } from '.'
import type { Size, WhereQuery } from '../../index'

export type TableHeaderOprType = 'create' | 'whereQuery' | 'orderQuery' | 'batchDelete' | 'refresh' | 'settings' | 'exportExcel'
export type TableHeaderProps<T> = {
  name: string
  fetching?: boolean
  rawBizColumns: VColumn<T>[]
  onUpdateBizColumns?: (columns: VColumn<T>[]) => void
  oprOrder?: TableHeaderOprType[]
  onNew?: () => T
  apiGroup?: () => ApiGroup<T>
  fetchList: () => Promise<void>
  onEditRowFromModal?: (row: T) => Promise<boolean>
  selectedIds?: number[]
  disableCreation?: boolean
  disableWhereQuery?: boolean
  whereQueryProps: WhereQueryProps<T>
  disableOrderQuery?: boolean
  orderQueryProps: OrderQueryProps<T>
  disableBatchDeletion?: boolean
  disableRefresh?: boolean
  disableSettings?: boolean
  exportExcel?: VTableExportExcelProps<T>
  extraWhereQueryInitValues?: WhereQuery<T>
  extraButtons?: {
    button: ButtonProps
    appendTo?: 'left' | 'right'
    withBatchData?: boolean
    batchFn?: (selectedIds: number[]) => Promise<void>
  }[]
  size?: Size
}
