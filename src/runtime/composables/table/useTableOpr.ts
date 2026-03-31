import { createSharedComposable } from '@vueuse/core'
import type { SelectOption, WhereQueryOpr, WhereQueryType } from '#v/types'

const _useTableOpr = () => {
  const oprMap = new Map<WhereQueryType, WhereQueryOpr[]>([
    ['input', ['eq', 'ne', 'like', 'not_like', 'start_like', 'end_like', 'is_empty', 'is_not_empty']],
    ['input-number', ['eq', 'ne', 'gt', 'gte', 'lt', 'lte']],
    ['select', ['in', 'not_in']],
    ['async-select', ['in', 'not_in']],
    ['date-picker', ['range_gte_lte', 'lt', 'lte', 'gt', 'gte', 'is_null', 'is_not_null']]
  ])
  const getOprListByType = (type: WhereQueryType): WhereQueryOpr[] => {
    return oprMap.get(type) || []
  }

  const defaultOprMap = new Map<WhereQueryType, WhereQueryOpr>([
    ['input', 'like'],
    ['input-number', 'eq'],
    ['select', 'in'],
    ['async-select', 'in'],
    ['date-picker', 'range_gte_lte']
  ])
  const getDefaultOprByType = (type: WhereQueryType | undefined): WhereQueryOpr => {
    return type ? defaultOprMap.get(type) || 'eq' : 'eq'
  }

  const inputNameMap = new Map<WhereQueryOpr, string>([
    ['eq', '等于'],
    ['ne', '不等于'],

    ['like', '包含'],
    ['not_like', '不包含'],
    ['start_like', '以...开始'],
    ['end_like', '以...结束'],

    ['is_empty', '为空'],
    ['is_not_empty', '不为空'],

    ['text_arr_str_like', '包含'] // 这个操作符是为了支持text-arr-input类型的输入，表示输入的多个值中包含任意一个即可
  ])
  const inputNumberNameMap = new Map<WhereQueryOpr, string>([
    ['eq', '='],
    ['ne', '≠'],

    ['gt', '>'],
    ['gte', '≥'],
    ['lt', '<'],
    ['lte', '≤']
  ])
  const selectNameMap = new Map<WhereQueryOpr, string>([
    ['in', '包含'],
    ['not_in', '不包含']
  ])
  const datePickerNameMap = new Map<WhereQueryOpr, string>([
    ['range_gte_lte', '范围'],
    ['lt', '早于'],
    ['lte', '早于等于'],
    ['gt', '晚于'],
    ['gte', '晚于等于'],
    ['is_null', '为空'],
    ['is_not_null', '不为空']
  ])
  const getOprNameMapByType = (type: WhereQueryType): Map<WhereQueryOpr, string> => {
    switch (type) {
      case 'input':
        return inputNameMap
      case 'input-number':
        return inputNumberNameMap
      case 'select':
      case 'async-select':
        return selectNameMap
      case 'date-picker':
        return datePickerNameMap
      default:
        return new Map<WhereQueryOpr, string>()
    }
  }
  const getOprNameOptionsByType = (type: WhereQueryType): SelectOption[] => {
    const nameMap = getOprNameMapByType(type)
    const oprList = getOprListByType(type)
    return oprList.map(opr => ({
      label: nameMap.get(opr) ?? opr ?? '未知操作符',
      value: opr as string
    }))
  }
  const getOprNameByTypeAndOpr = (type: WhereQueryType, opr: WhereQueryOpr): string => {
    const nameMap = getOprNameMapByType(type)
    return nameMap.get(opr) || '未知操作符'
  }

  return {
    getOprListByType,
    getDefaultOprByType,

    getOprNameMapByType,
    getOprNameOptionsByType,
    getOprNameByTypeAndOpr
  }
}

export const useTableOpr = createSharedComposable(_useTableOpr)
