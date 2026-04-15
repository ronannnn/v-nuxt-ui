import type { OrderQueryOpr, WhereQueryOpr } from '../../query'
import type { TableColumn, BadgeProps, InputMenuProps } from '@nuxt/ui'
import type { SelectOption, VAsyncSelectProps } from '../../index'

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
    empty?: BadgeProps
    placeholder?: InputMenuProps['placeholder']
  }
  | {
    type: 'async-select'
  } & VAsyncSelectProps<T>
  | { type: 'unknown' }
)

export type OrderQueryColumnOption = {
  defaultOpr?: OrderQueryOpr
}

export type VColumn<T> = {
  filterOption?: WhereQueryColumnOption<any> // 这里不能是T，因为 filterOption 的配置可能与 T 无关，例如一个T是user，这里是查询部门
  sortOption?: OrderQueryColumnOption | true
  initHide?: boolean
  checked?: boolean
  // 使用方法签名以保持 T 的双变，允许 VColumn<Sub> 赋值给 VColumn<Record<string, any>>
  exportCell?(row: T): string | string[]
} & TableColumn<T>
