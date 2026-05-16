import type { VFormFieldProps } from '#v/types'
import dayjs from 'dayjs'
import { diffWords, diffChars } from 'diff'
import { dateFormat } from '#v/constants'

export function resolveSelectLabel(
  rawVal: unknown,
  items: readonly any[]
): string {
  if (Array.isArray(rawVal)) {
    return rawVal
      .map(v => items.find(i => i?.value === v)?.label ?? String(v))
      .join(', ') || ''
  }
  return items.find(i => i?.value === rawVal)?.label ?? String(rawVal)
}

export function resolveDisplayValue(
  field: VFormFieldProps,
  rawVal: unknown,
  modelSource: Record<string, unknown>
): string {
  if (rawVal === null || rawVal === undefined) return ''

  switch (field.type) {
    case 'switch':
    case 'button-switch':
      return rawVal ? '是' : '否'

    case 'date-picker': {
      if (typeof rawVal === 'string') {
        const d = dayjs(rawVal)
        if (d.isValid()) return d.format(dateFormat)
      }
      return String(rawVal)
    }

    case 'select': {
      const items = field.enableEmptyOption
        ? [{ label: '无', value: 0 as unknown }, ...(field.items ?? [])]
        : (field.items ?? [])
      return resolveSelectLabel(rawVal, items)
    }

    case 'multiple-select-string':
    case 'radio-select':
      return resolveSelectLabel(rawVal, (field as { items?: { label: string, value: unknown }[] }).items ?? [])

    case 'async-select':
    case 'async-tree-select':
    case 'async-object-select': {
      if (!field.name) return String(rawVal)
      if (rawVal === 0) return ''

      const labelField = (field as unknown as Record<string, unknown>).labelField as string | undefined
      if (!labelField) return String(rawVal)

      let model: unknown
      for (const v of Object.values(modelSource)) {
        if (v && typeof v === 'object' && (v as Record<string, unknown>)[labelField] !== undefined) {
          if (String((v as Record<string, unknown>).id) === String(rawVal)) {
            model = v
            break
          }
        }
      }
      if (!model) {
        model = (field as unknown as Record<string, unknown>).initModel
      }
      if (!model) return String(rawVal)

      if (Array.isArray(model)) {
        return model
          .map(m => (m && typeof m === 'object' ? String((m as Record<string, unknown>)[labelField] ?? '') : String(m)))
          .filter(Boolean)
          .join(', ') || ''
      }

      if (typeof model === 'object') {
        const label = (model as Record<string, unknown>)[labelField]
        if (label != null) return String(label)
      }
      return String(rawVal)
    }

    case 'input-string-number': {
      const v = rawVal === 0 ? '0' : String(rawVal)
      const trailing = (field as { trailingString?: string }).trailingString
      return trailing ? `${v} ${trailing}` : v
    }

    case 'tree-select-transfer': {
      if (Array.isArray(rawVal)) {
        return rawVal
          .map((item) => {
            if (item && typeof item === 'object') {
              const obj = item as Record<string, unknown>
              return String(obj.label ?? obj.name ?? '')
            }
            return String(item)
          })
          .filter(Boolean)
          .join(', ') || ''
      }
      return formatValue(rawVal)
    }

    default:
      return formatValue(rawVal)
  }
}

export function smartDiff(oldStr: string, newStr: string) {
  if (!oldStr.includes(' ') && !newStr.includes(' ')) {
    return diffChars(oldStr, newStr)
  }
  return diffWords(oldStr, newStr)
}

export const diffEligibleTypes = new Set([
  'input',
  'dynamic-input',
  'input-string-number',
  'input-number',
  'textarea',
  'input-pwd',
  'sql-editor',
  'date-picker'
])

export function formatValue(val: unknown): string {
  if (val === null || val === undefined) return ''
  if (typeof val === 'boolean') return val ? '是' : '否'
  if (typeof val === 'object') return JSON.stringify(val)
  return String(val)
}
