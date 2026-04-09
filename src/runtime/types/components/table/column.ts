import type { OrderQueryOpr, WhereQueryOpr, QueryTemplate, WhereQueryItem } from '../../query'
import type { PageResult, RequestResult } from '../../request'
import type { TableColumn, BadgeProps, InputMenuProps } from '@nuxt/ui'
import type { SelectOption } from '../../index'
import type { Ref } from 'vue'

export type WhereQueryType = 'input' | 'input-number' | 'date-picker' | 'select' | 'async-select' | 'unknown'

/**
 * 专用于 WhereQueryColumnOption async-select 分支的属性类型。
 * 与 VFormFieldAsyncSelectProps<T> 结构一致，但 listApi 使用方法签名。
 * 函数属性使用方法签名以保持 T 的双变性（bivariant），
 * 使 VColumn<SubType> 可以安全赋值给 VColumn<Record<string, any>>。
 */
export type WhereQueryColumnAsyncSelectProps<T> = {
  // 使用方法签名以保持 T 的双变
  listApi(payload: Omit<QueryTemplate<T>, 'selectQuery'>): Promise<{ data: Ref<RequestResult<PageResult<T>>> }>
  extraQuery?: QueryTemplate<T>
  searchFields: string[]
  extraSearchFieldFn?(keyword: string): WhereQueryItem<T>
  labelField?: keyof T
  valueField: keyof T
  labelRenderFn?(model: T): string | undefined
  enableEmptyOption?: boolean
  disableOprSelector?: boolean
  multiple?: boolean
  placeholder?: InputMenuProps['placeholder']
  size?: InputMenuProps['size']
}

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
  } & WhereQueryColumnAsyncSelectProps<T>
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
