import type { ButtonProps } from '@nuxt/ui'
import type { OrderQuery, OrderQueryColumnOption, VColumn } from '../../..'

export type OrderQueryOption<T> = {
  field: keyof T
  label?: string
} & OrderQueryColumnOption

export type OrderQueryProps<T> = {
  orderOptions: OrderQueryOption<T>[]
  defaultOrderQuery?: OrderQuery<T>
  orderQuery: OrderQuery<T>
  onUpdateOrderQuery: (query: OrderQuery<T>) => void
  fetching?: boolean
  triggerFetching: () => Promise<void>
  bizColumns: VColumn<T>[]
  size?: ButtonProps['size']
}
