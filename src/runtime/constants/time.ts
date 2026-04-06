import type { SelectOption } from '#v/types'

export const TIME_ZONE = 'Asia/Shanghai'

export const timeUnitOptions: SelectOption[] = [
  { label: '年', value: 'year' },
  { label: '季', value: 'quarter' },
  { label: '月', value: 'month' },
  { label: '周', value: 'week' },
  { label: '日', value: 'day' }
]

export const weekEnLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
export const weekCnLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

export const dateFormat = 'YYYY-MM-DD'
export const dateTimeFormat = 'YYYY-MM-DD HH:mm:ss'
