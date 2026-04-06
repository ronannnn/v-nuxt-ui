import type { SelectOption } from '#v/types'

export const TIME_ZONE = 'Asia/Shanghai'

export const timeUnitOptions: SelectOption[] = [
  { label: 'Year', value: 'year' },
  { label: 'Quarter', value: 'quarter' },
  { label: 'Month', value: 'month' },
  { label: 'Week', value: 'week' },
  { label: 'Day', value: 'day' }
]

export const weekEnLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
export const weekCnLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

export const dateFormat = 'YYYY-MM-DD'
export const dateTimeFormat = 'YYYY-MM-DD HH:mm:ss'
