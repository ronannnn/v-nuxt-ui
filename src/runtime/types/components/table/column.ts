import type { Component } from 'vue'
import type { OrderQueryOpr, WhereQueryOpr } from '../../query'
import type { BadgeProps, TableColumn } from '@nuxt/ui'
import type { VAsyncSelectProps, VSelectProps } from '../../index'

export type WhereQueryType = 'input' | 'input-number' | 'date-picker' | 'select' | 'async-select' | 'custom' | 'unknown'

export type WhereQueryColumnOption<T> = {
  defaultOpr?: WhereQueryOpr
  custom?: boolean
  initValues?: any
  /** 查询条件是否默认隐藏（initHide=true 时不在 where 面板显示） */
  initHide?: boolean
  preferred?: boolean
  disableOprSelector?: boolean
} & (
  | { type: 'input' }
  | { type: 'input-number' }
  | { type: 'date-picker' }
  | {
    type: 'select'
    variant?: BadgeProps['variant']
    empty?: BadgeProps
  } & VSelectProps<T>
  | {
    type: 'async-select'
  } & VAsyncSelectProps<T>
  | {
    /**
     * 自定义查询组件。组件通过 `v-model:where-query-item` 读写整条 WhereQueryItem
     * （自行维护 value / opr），并在需要时调用 triggerFetching。
     * 通常配合 disableOprSelector + defaultOpr 使用。
     */
    type: 'custom'
    component: Component
    componentProps?: Record<string, unknown>
  }
  | { type: 'unknown' }
)

export type OrderQueryColumnOption = {
  defaultOpr?: OrderQueryOpr
}

export type VColumn<T> = {
  filterOption?: WhereQueryColumnOption<any> // 这里不能是T，因为 filterOption 的配置可能与 T 无关，例如一个T是user，这里是查询部门
  sortOption?: OrderQueryColumnOption | true
  /** 列是否默认隐藏（控制表格列可见性） */
  initHide?: boolean
  checked?: boolean
  // 使用方法签名以保持 T 的双变，允许 VColumn<Sub> 赋值给 VColumn<Record<string, any>>
  exportCell?(row: T): string | string[]
} & TableColumn<T>
