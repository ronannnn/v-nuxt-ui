import type { InputMenuItem, InputMenuProps } from '@nuxt/ui'

export type VSelectProps<T> = {
  // meta
  label?: string // 用于floating label显示
  floatingPlaceholder?: boolean
  disabled?: InputMenuProps['disabled']
  placeholder?: InputMenuProps['placeholder']
  size?: InputMenuProps['size']
  icon?: InputMenuProps['icon']
  enableEmptyOption?: boolean

  items: InputMenuItem[]
  multiple?: boolean
  afterSelect?(selected: T | T[] | undefined): void

  roundedNone?: boolean // TODO:
}
