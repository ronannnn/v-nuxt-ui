import type { ButtonProps } from '@nuxt/ui'
import type { ApiGroup, OrderQueryProps, VColumn, VTableExportExcelProps, WhereQueryProps } from '.'
import type { Size, WhereQuery } from '../../index'
import type { Column } from '../../storage'

export type TableHeaderOprType = 'create' | 'whereQuery' | 'orderQuery' | 'batchDelete' | 'refresh' | 'settings' | 'exportExcel'
export type TableHeaderProps<T> = {
  name: string
  tblName?: string
  fetching?: boolean
  rawBizColumns: VColumn<T>[]
  onUpdateBizColumns?: (columns: VColumn<T>[], storageColumns?: Column[]) => void
  oprOrder?: TableHeaderOprType[]
  onNew?: () => T
  apiGroup?: () => ApiGroup<T>
  fetchList: () => Promise<void>
  onEditRowFromModal?: (row: T) => Promise<boolean>
  selectedIds?: number[]
  selectedModels?: T[]
  displayFnInDeleteModal?: (model: T) => string | undefined
  disableCreation?: boolean
  disableWhereQuery?: boolean
  whereQueryMode?: 'inline' | 'popover'
  whereQueryPopoverWidth?: string | number
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
