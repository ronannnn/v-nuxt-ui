import type { VColumn, WhereQuery, WhereQueryColumnOption, WhereQueryItemGroup } from '../../..'

export type WhereQueryOption<T> = {
  field: string & keyof T | string
  label: string
} & WhereQueryColumnOption<T>

export type WhereQueryProps<T> = {
  whereOptions: WhereQueryOption<T>[]
  extraWhereQueryInitValues?: WhereQuery<T>
  defaultWhereQuery?: WhereQuery<T> // extraWhereQueryInitValues + columns default values
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

export type WhereAdvancedQueryProps<T> = {
  group?: WhereQueryItemGroup<T>
  onUpdateGroup?: (items: WhereQueryItemGroup<T>) => void
} & Pick<WhereQueryProps<T>, 'whereOptions' | 'fetching' | 'triggerFetching' | 'bizColumns'>
