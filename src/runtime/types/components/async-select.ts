import type { ApiGroup, QueryTemplate, WhereQueryItem } from '#v/types'
import type { Component } from 'vue'
import type { InputMenuProps } from '@nuxt/ui'

export type VAsyncSelectProps<T> = {
  // meta
  label?: string // 用于floating label显示
  floatingPlaceholder?: boolean
  disabled?: InputMenuProps['disabled']
  placeholder?: InputMenuProps['placeholder']
  size?: InputMenuProps['size']
  icon?: InputMenuProps['icon']

  // query
  listApi: ApiGroup<T>['list']
  searchFields?(keyword: string): WhereQueryItem<T>[] // 查询字段设置
  likeSearchFields?: string[] // 模糊查询字段，会自动转换成 { field, opr: 'like', value: searchTerm, andOr: 'or' } 的字段设置
  extraQuery?: QueryTemplate<T> // 额外的查询参数，会和组件内部生成的查询参数合并
  fetchAll?: boolean // query中是否获取全部数据

  // options related
  labelField: keyof T
  valueField: keyof T
  labelRenderFn?(model: T): string | undefined
  enableEmptyOption?: boolean

  multiple?: boolean
  afterSelect?(selected: T | T[] | undefined): void

  // can create
  canCreate?: boolean
  createModalComponent?: Component
  createModalOpenProps?: Record<string, any>
}

export type AsyncSelectValue = string[] | number[] | string | number | undefined
export type AsyncSelectCombinedValue = {
  values: AsyncSelectValue
  extraModels?: any[]
}
