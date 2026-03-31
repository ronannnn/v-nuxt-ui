import { createSharedComposable } from '@vueuse/core'
import { toZoned, parseAbsolute, type DateValue } from '@internationalized/date'
import dayjs from 'dayjs'
import { TIME_ZONE } from '#v/constants/time'
import type { DateRange } from 'reka-ui'
import type { DateShortcut } from '#v/types/components/date'

const _useDate = () => {
  const dayjsToDateValue = (date: dayjs.Dayjs | null | undefined): DateValue | undefined => {
    if (!date || !date.isValid()) return undefined
    return parseAbsolute(date.toISOString(), TIME_ZONE)
  }
  const isoUtcStringToDateValue = (isoString: string | null | undefined): DateValue | undefined => {
    if (!isoString) return undefined
    return dayjsToDateValue(dayjs(isoString))
  }

  const dateValueToDayjs = (dateValue: DateValue | null | undefined): dayjs.Dayjs | undefined => {
    if (!dateValue) return undefined
    return dayjs(toZoned(dateValue, TIME_ZONE).toAbsoluteString()).tz(TIME_ZONE)
  }

  const formatTimeUnit = (dateValue: DateValue | null | undefined, unit: Const.Time.TimeUnit): string => {
    const date = dateValueToDayjs(dateValue)
    if (!date || !date.isValid()) return ''

    switch (unit) {
      case 'year':
        return date.year().toString()
      case 'quarter': {
        const quarter = Math.ceil(date.month() + 1 / 3)
        const quarterNames = ['Q1', 'Q2', 'Q3', 'Q4']
        return `${date.year()}-${quarterNames[quarter - 1]}`
      }
      case 'month':
        return date.format('YYYY-MM')
      case 'week': {
        const yearStart = date.startOf('year')
        const weekStart = date.startOf('week')
        const weekNumber = weekStart.diff(yearStart, 'week') + 1
        return `${date.year()}-W${weekNumber}`
      }
      case 'day':
        return date.format('YYYY/MM/DD')
      default:
        throw new Error(`Unsupported time unit: ${unit}`)
    }
  }

  const getRecentDateRange = (days: number): DateRange => {
    const end = dayjs().endOf('day')
    const start = end.subtract(days - 1, 'day').startOf('day')
    return {
      start: dayjsToDateValue(start)!,
      end: dayjsToDateValue(end)!
    }
  }

  const getlastWeekDateRange = (): DateRange => {
    const end = dayjs().subtract(1, 'week').endOf('week')
    const start = end.subtract(6, 'day').startOf('day')
    return {
      start: dayjsToDateValue(start)!,
      end: dayjsToDateValue(end)!
    }
  }
  const lastWeekDateShortcut: DateShortcut = {
    label: '上周',
    dateFn: getlastWeekDateRange
  }
  const getCurrentWeekDateRange = (): DateRange => {
    const end = dayjs().endOf('week')
    const start = end.subtract(6, 'day').startOf('day')
    return {
      start: dayjsToDateValue(start)!,
      end: dayjsToDateValue(end)!
    }
  }
  const currentWeekDateShortcut: DateShortcut = {
    label: '本周',
    dateFn: getCurrentWeekDateRange
  }
  const getLastMonthDateRange = (): DateRange => {
    const end = dayjs().subtract(1, 'month').endOf('month')
    const start = end.subtract(1, 'month').startOf('month')
    return {
      start: dayjsToDateValue(start)!,
      end: dayjsToDateValue(end)!
    }
  }
  const lastMonthDateShortcut: DateShortcut = {
    label: '上月',
    dateFn: getLastMonthDateRange
  }
  const getCurrentMonthDateRange = (): DateRange => {
    const end = dayjs().endOf('month')
    const start = end.subtract(1, 'month').startOf('month')
    return {
      start: dayjsToDateValue(start)!,
      end: dayjsToDateValue(end)!
    }
  }
  const currentMonthDateShortcut: DateShortcut = {
    label: '本月',
    dateFn: getCurrentMonthDateRange
  }
  const getlastYearDateRange = (): DateRange => {
    const end = dayjs().subtract(1, 'year').endOf('year')
    const start = end.subtract(1, 'year').startOf('year')
    return {
      start: dayjsToDateValue(start)!,
      end: dayjsToDateValue(end)!
    }
  }
  const lastYearDateShortcut: DateShortcut = {
    label: '去年',
    dateFn: getlastYearDateRange
  }
  const getCurrentYearDateRange = (): DateRange => {
    const end = dayjs().endOf('year')
    const start = end.subtract(1, 'year').startOf('year')
    return {
      start: dayjsToDateValue(start)!,
      end: dayjsToDateValue(end)!
    }
  }
  const currentYearDateShortcut: DateShortcut = {
    label: '今年',
    dateFn: getCurrentYearDateRange
  }
  const getLastYearToTodayDateRange = (): DateRange => {
    const end = dayjs().endOf('day')
    const start = dayjs().subtract(1, 'year').startOf('day')
    return {
      start: dayjsToDateValue(start)!,
      end: dayjsToDateValue(end)!
    }
  }
  const lastYearToTodayDateShortcut: DateShortcut = {
    label: '去年至今',
    dateFn: getLastYearToTodayDateRange
  }

  return {
    dayjsToDateValue,
    isoUtcStringToDateValue,
    dateValueToDayjs,
    formatTimeUnit,
    getRecentDateRange,

    getlastWeekDateRange,
    lastWeekDateShortcut,

    getCurrentWeekDateRange,
    currentWeekDateShortcut,

    getLastMonthDateRange,
    lastMonthDateShortcut,

    getCurrentMonthDateRange,
    currentMonthDateShortcut,

    getlastYearDateRange,
    lastYearDateShortcut,

    getCurrentYearDateRange,
    currentYearDateShortcut,

    getLastYearToTodayDateRange,
    lastYearToTodayDateShortcut
  }
}

export const useDate = createSharedComposable(_useDate)
