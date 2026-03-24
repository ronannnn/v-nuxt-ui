import type { ModalProps } from '@nuxt/ui'
import type { ApiGroup } from '../table'
import type { VFormFieldProps } from './field'

export * from './field'

export type FormTemplateProps<T> = {
  fields: VFormFieldProps<T>[]
  modelValue: Partial<T>
  onUpdateModelValue?: (newVal: Partial<T>) => void
  onTriggerSubmit?: (e: Event) => void
}

export type CreateModalFormTemplateProps<T> = {
  title: string
  description?: string
  onClose: (ok: boolean) => void
  onSubmit: () => Promise<void>
  fields: VFormFieldProps<T>[]
  modelValue: Partial<T>
  onUpdateModelValue?: (newVal: Partial<T>) => void
  rowKey?: keyof T
  fullscreen?: ModalProps['fullscreen']
}

export type CreateModalFormTemplatePropsWithApi<T> = {
  apiGroup: () => ApiGroup<T>
  valuePruneFn?: (value: T) => T
  defaultModelValue?: Partial<T>
  onSave: (model: T) => void
} & Pick<CreateModalFormTemplateProps<T>, 'title' | 'description' | 'fields' | 'onClose' | 'modelValue' | 'onUpdateModelValue'>
