import type { SidebarProps } from '@nuxt/ui'
import type { I18nLocale } from './locale'

/** Header config */
export interface HeaderConfig {
  hideHeader?: boolean
  headerClass?: string
  headerHeight?: number
}

/** Tab config */
export interface TabConfig {
  hideTab?: boolean
  tabClass?: string
  tabHeight?: number
}

/** Sider config */
interface SiderConfig {
  side?: SidebarProps['side']
  variant?: SidebarProps['variant']
  collapsible?: SidebarProps['collapsible']
  hideSider?: boolean
  siderClass?: string
  siderMobileClass?: string
  siderMaxWidth?: number
  siderMinWidth?: number
  siderCollapsed?: boolean
  siderCollapsedWidth?: number
}

/** Content config */
export interface ContentConfig {
  contentClass?: string
}

export type PageAnimateMode = 'fade' | 'fade-slide' | 'fade-bottom' | 'fade-scale' | 'zoom-fade' | 'zoom-out' | 'none'
export interface PageConfig {
  pageAnimate?: boolean
  pageAnimateMode?: PageAnimateMode
}

/** Custom app props */
export interface CustomAppConfig extends SiderConfig, HeaderConfig, TabConfig, ContentConfig, PageConfig {
  primary?: string
  blackAsPrimary?: boolean
  neutral?: string
  radius?: number
  locale?: I18nLocale
  keepalive?: boolean
}
