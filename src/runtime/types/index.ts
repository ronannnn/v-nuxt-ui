import type { BadgeProps } from '@nuxt/ui'

export * from './cmds/index'
export * from './models/index'
export * from './components/index'
export * from './app'
export * from './locale'
export * from './request'
export * from './query'
export * from './storage'
export * from './time'

export type Size = import('@nuxt/ui').ButtonProps['size']

export type SelectOption = {
  label: string
  value: any
  color?: BadgeProps['color']
  icon?: BadgeProps['icon']
}
