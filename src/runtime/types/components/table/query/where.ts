import type { VColumn, WhereQuery, WhereQueryColumnOption, WhereQueryItem, WhereQueryItemGroup } from '../../../types'

export type WhereQueryOption<T> = {
  field: keyof T | string
  label: string
} & Partial<WhereQueryColumnOption<T>>

export type WhereQueryProps<T> = {
  whereOptions: WhereQueryOption<T>[]
  defaultWhereQuery?: WhereQuery<T>
  whereQuery: WhereQuery<T> | undefined
  onUpdateWhereQuery: (query: WhereQuery<T> | undefined) => void
  whereQueryOpen?: boolean
  onUpdateWhereQueryOpen?: (open: boolean) => void
  isWhereQueryValueEmpty?: boolean
  fetching?: boolean
  triggerFetching: (fromStart: boolean) => Promise<void>
  bizColumns?: VColumn<T>[]
  hideQueryButton?: boolean
}

export type WhereSimpleQueryProps<T> = {
  items?: WhereQueryItem<T>[]
  onUpdateItems: (items: WhereQueryItem<T>[] | undefined) => void
} & Pick<WhereQueryProps<T>, 'whereOptions' | 'fetching' | 'triggerFetching' | 'bizColumns'>

export type WhereAdvancedQueryProps<T> = {
  group?: WhereQueryItemGroup<T>
  onUpdateGroup?: (items: WhereQueryItemGroup<T>) => void
} & Pick<WhereQueryProps<T>, 'whereOptions' | 'fetching' | 'triggerFetching' | 'bizColumns'>
