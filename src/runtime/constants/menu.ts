export enum MenuType {
  CATALOG = 'catalog',
  MENU = 'menu',
  BUTTON = 'button'
}

export const menuTypeOptions = [
  { label: '目录', value: MenuType.CATALOG },
  { label: '菜单', value: MenuType.MENU },
  { label: '按钮', value: MenuType.BUTTON }
]
