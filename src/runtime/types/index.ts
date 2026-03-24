import type { BadgeProps } from '@nuxt/ui'

export * from './app'
export * from './locale'
export * from './request'
export * from './components'
export * from './query'
export * from './storage'

export type Size = import('@nuxt/ui').ButtonProps['size']

export type SelectOption = {
  label: string
  value: any
  color?: BadgeProps['color']
  icon?: BadgeProps['icon']
}
