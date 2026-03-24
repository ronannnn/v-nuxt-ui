import type { OrderQueryOpr, WhereQueryOpr } from '../../query'
import type { TableColumn, BadgeProps } from '@nuxt/ui'
import type { SelectOption, VFormFieldAsyncSelectProps } from '../../index'

export type WhereQueryType = 'input' | 'input-number' | 'date-picker' | 'select' | 'async-select' | 'unknown'

export type WhereQueryColumnOption<T> = {
  defaultOpr?: WhereQueryOpr
  custom?: boolean
  initValues?: any
  initHide?: boolean
  disableOprSelector?: boolean
} & (
  | { type: 'input' }
  | { type: 'input-number' }
  | { type: 'date-picker' }
  | {
    type: 'select'
    variant?: BadgeProps['variant']
    items: SelectOption[]
  }
  | {
    type: 'async-select'
  } & VFormFieldAsyncSelectProps<T>
  | { type: 'unknown' }
)

export type OrderQueryColumnOption = {
  defaultOpr?: OrderQueryOpr
}

export type VColumn<T> = {
  filterOption?: WhereQueryColumnOption<any>
  sortOption?: OrderQueryColumnOption | true
  initHide?: boolean
  checked?: boolean
  exportCell?: (row: T) => string | string[]
} & TableColumn<T>
