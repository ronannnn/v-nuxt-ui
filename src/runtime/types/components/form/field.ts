import type { VNode } from 'vue'
import type { ButtonProps, FormFieldProps, InputProps, RadioGroupProps, SelectMenuItem, SelectProps, TreeItem } from '@nuxt/ui'
import type { ZodType } from 'zod'
import type { VAsyncSelectProps } from '#v/types'

export type VFormFieldAsyncSelectProps<T> = {
  initModel?: any | any[] // 用于form表单的初始值设置，有些值是id，需要传入id对应model来显示值
  onUpdateInitModel?(model: any | any[] | undefined): void // initModel设置后会触发这个回调，传入model值，方便外部获取到model值
} & VAsyncSelectProps<T>

export type VFormFieldAsyncTreeSelectProps<T> = {
  initModel?: any | any[] // 用于form表单的初始值设置，有些值是id，需要传入id对应model来显示值
  onUpdateInitModel?(model: any | any[] | undefined): void // initModel设置后会触发这个回调，传入model值，方便外部获取到model值
} & VAsyncSelectProps<T>

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

export type VFormFieldProps = FormFieldProps & {
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
  | { type: 'async-select' } & VFormFieldAsyncSelectProps<any>
  | { type: 'async-object-select' } & VFormFieldAsyncSelectProps<any>
  | { type: 'async-tree-select' } & VFormFieldAsyncTreeSelectProps<any>
  | { type: 'radio-select' } & RadioGroupProps
  | { type: 'tree-select-transfer' } & VFormFieldTreeSelectTransferProps
  | { type: 'sql-editor' }
  | { type: 'custom', component: VNode }
  | { type: 'unknown' }
)
