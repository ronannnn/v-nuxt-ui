import type { WhereQueryColumnOption } from '#v/types'

export const tableWhereQueryItemIconMap: Map<WhereQueryColumnOption<any>['type'], string> = new Map([
  ['async-select', 'i-lucide-list-todo'],
  ['date-picker', 'i-lucide-calendar'],
  ['input', 'i-lucide-pen-line'],
  ['input-number', 'i-lucide-pen-line'],
  ['select', 'i-lucide-list-todo'],
  ['unknown', 'i-lucide-circle-question-mark']
])
