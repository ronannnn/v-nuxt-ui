export enum CalendarEventType {
  NONE = 0,
  HOLIDAY = 1,
  ADJUSTRED = 2,
  WEEKEND = 3
}

export const calendarEventTypeOptions = [
  { label: '国家法定假', value: CalendarEventType.HOLIDAY, color: 'primary' },
  { label: '公司调整假', value: CalendarEventType.ADJUSTRED, color: 'warning' },
  { label: '周末休息日', value: CalendarEventType.WEEKEND, color: 'success' },
  { label: '无', value: CalendarEventType.NONE, color: 'neutral' }
]

export const calendarEventTypeShortNameMap = new Map<CalendarEventType, string>([
  [CalendarEventType.NONE, '班'],
  [CalendarEventType.HOLIDAY, '假'],
  [CalendarEventType.ADJUSTRED, '调'],
  [CalendarEventType.WEEKEND, '休']
])
