// range
export interface RangeQuery {
  start?: any
  end?: any
}

// pagination
export interface Pagination {
  pageNum: number
  pageSize: number
}

export interface QueryTemplate<T> {
  pagination?: Pagination
  selectQuery?: SelectQuery<T>
  whereQuery?: WhereQuery<T>
  orderQuery?: OrderQuery<T>
  skipCount?: boolean
}

// select query
export type SelectQuery<T> = SelectQueryItem<T>[]
export interface SelectQueryItem<T> {
  field: keyof T | string
  distinct: boolean
}

// where query
export const noValueOprList: WhereQueryOpr[] = ['is_null', 'is_not_null', 'is_empty', 'is_not_empty']
export type WhereQueryOpr = 'eq' | 'ne'
  | 'gt' | 'gte' | 'lt' | 'lte'
  | 'like' | 'not_like' | 'start_like' | 'end_like'
  | 'in' | 'not_in'
  | 'is' | 'is_not'
  | 'is_null' | 'is_not_null'
  | 'is_empty' | 'is_not_empty'
  | 'str_len_eq' | 'str_len_ne'
  | 'str_len_gt' | 'str_len_gte' | 'str_len_lt' | 'str_len_lte'
  | 'range_gt_lt' | 'range_gt_lte' | 'range_gte_lt' | 'range_gte_lte'
  | 'bigint_arr_any' | 'bigint_arr_all'
  | 'text_arr_str_like'
  | null
export type WhereQuery<T> = {
  items?: WhereQueryItem<T>[]
  groups?: WhereQueryItemGroup<T>[]
}
export interface WhereQueryItemGroup<T> {
  andOr?: 'and' | 'or'
  items?: WhereQueryItem<T>[]
  groups?: WhereQueryItemGroup<T>[]
}
export interface WhereQueryItem<T> {
  andOr?: 'and' | 'or'
  field: keyof T | string
  opr: WhereQueryOpr
  value?: any
  custom?: boolean
  extraData?: any
}

// order query
export type OrderQueryOpr = 'asc' | 'desc' | 'str_len_asc' | 'str_len_desc' | null
export type OrderQuery<T> = OrderQueryItem<T>[]
export interface OrderQueryItem<T> {
  field: keyof T | string
  order: OrderQueryOpr
}
