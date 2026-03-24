import type { DropdownMenuItem } from '@nuxt/ui'
import type { Size } from '../../index'

export type TablePaginationProps<T> = {
  data: T[]
  selectedIds?: number[]
  pageNum: number
  pageSize: number
  total: number
  onUpdatePage: (page: number) => void
  pageSizeDropdownMenuItems: DropdownMenuItem[]
  hidePagination?: boolean
  fetching?: boolean
  size?: Size
}
