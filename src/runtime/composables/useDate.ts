import { toZoned, parseAbsolute, type DateValue } from '@internationalized/date'
import dayjs from 'dayjs'

export const TIME_ZONE = 'Asia/Shanghai'

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

  return { dayjsToDateValue, isoUtcStringToDateValue, dateValueToDayjs, formatTimeUnit }
}

export const useDate = createSharedComposable(_useDate)
