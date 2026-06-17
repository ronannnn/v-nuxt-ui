import type { WhereQueryColumnOption } from '#v/types'

export const tableWhereQueryItemIconMap: Map<WhereQueryColumnOption<any>['type'], string> = new Map([
  ['async-select', 'i-lucide-list-check'],
  ['date-picker', 'i-lucide-calendar-cog'],
  ['input', 'i-lucide-text-cursor-input'],
  ['input-number', 'i-lucide-text-cursor-input'],
  ['select', 'i-lucide-list-check'],
  ['custom', 'i-lucide-sliders-horizontal'],
  ['unknown', 'i-lucide-circle-question-mark']
])
