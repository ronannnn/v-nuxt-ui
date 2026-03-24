import type { DateRange, DateValue } from 'reka-ui'

export type DateShortcut = { label: string, dateFn: () => null | undefined | DateValue | DateValue[] | DateRange }
