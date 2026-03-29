import type { VNode } from 'vue'
import type { ButtonProps, FormFieldProps, InputProps, RadioGroupProps, SelectMenuItem, SelectProps, TreeItem } from '@nuxt/ui'
import type { ZodType } from 'zod'
import type { ListApi } from '../table'
import type { QueryTemplate, WhereQueryItem } from '../../query'

export type VFormFieldAsyncSelectProps<T> = {
  listApi: ListApi<T>
  extraQuery?: QueryTemplate<T>
  initModelValues?: any | any[]
  onUpdateInitModelValues?: (newInitModels: any | any[]) => void
  searchFields: (string)[]
  extraSearchFieldFn?: (keyword: string) => WhereQueryItem<T>
  labelField?: string
  valueField?: string
  labelRenderFn?: (model: T) => string | undefined
  enableEmptyOption?: boolean
  disableOprSelector?: boolean
  multiple?: boolean
  placeholder?: string
  size?: SelectProps['size']
}
export type VFormFieldAsyncTreeSelectProps<T> = {
  fetchAll?: boolean
} & VFormFieldAsyncSelectProps<T>

export type VFormFieldTreeSelectTransferProps = {
  sourceTreeItems: TreeItem[]
  targetTreeItems: TreeItem[]
  onUpdateTargetTreeItems: (val: TreeItem[]) => void
  disabled?: boolean
}

export type VFormFieldSelectProps = {
  items: SelectMenuItem[]
  searchable?: boolean
  multiple?: SelectProps['multiple']
  enableEmptyOption?: boolean
} & Pick<SelectProps, 'placeholder'>

export type VFormFieldDynamicObjectInputProps = {
  objectFields: Array<{
    key: string
    label: string
    placeholder?: string
  }>
}

export type VFormFieldProps<T> = FormFieldProps & {
  zodType?: ZodType
  colSpan?: string
  icon?: string
  disabled?: boolean
  hidden?: boolean
  placeholder?: string
  annotation?: string
  enterKeydownSubmit?: boolean
} & (
  | { type: 'separator', separatorLabel?: string }
  | { type: 'input' } & Pick<InputProps, 'placeholder'>
  | { type: 'dynamic-input', delimiter?: string }
  | { type: 'dynamic-input-object' } & VFormFieldDynamicObjectInputProps
  | { type: 'input-pwd' } & Pick<InputProps, 'placeholder'>
  | { type: 'input-number' } & Pick<InputProps, 'placeholder'>
  | {
    type: 'input-string-number'
    trailingString?: string
  } & Pick<InputProps, 'placeholder'>
  | { type: 'switch' }
  | { type: 'button-switch' }
  | { type: 'textarea' } & Pick<InputProps, 'placeholder'>
  | {
    type: 'date-picker'
    peerButtons?: ButtonProps[]
  }
  | {
    type: 'select'
  } & VFormFieldSelectProps
  | {
    type: 'multiple-select-string'
    items: SelectMenuItem[]
    searchable?: boolean
  }
  | { type: 'async-select' } & VFormFieldAsyncSelectProps<T>
  | { type: 'async-object-select' } & VFormFieldAsyncSelectProps<T>
  | { type: 'async-tree-select' } & VFormFieldAsyncTreeSelectProps<T>
  | { type: 'radio-select' } & RadioGroupProps
  | { type: 'tree-select-transfer' } & VFormFieldTreeSelectTransferProps
  | { type: 'sql-editor' }
  | { type: 'custom', component: VNode }
  | { type: 'unknown' }
)
