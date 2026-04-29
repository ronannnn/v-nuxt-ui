interface CronFields {
  minute: string
  hour: string
  dayOfMonth: string
  month: string
  dayOfWeek: string
}

const WEEKDAY_CN: string[] = ['日', '一', '二', '三', '四', '五', '六']

function pad(v: number): string {
  return String(v).padStart(2, '0')
}

function parseFields(cron: string): CronFields | null {
  const parts = cron.trim().split(/\s+/)
  if (parts.length !== 5) return null
  return {
    minute: parts[0]!,
    hour: parts[1]!,
    dayOfMonth: parts[2]!,
    month: parts[3]!,
    dayOfWeek: parts[4]!
  }
}

function validateField(val: string, min: number, max: number): boolean {
  if (val === '*' || val === '?') return true
  const segments = val.split(',')
  for (const seg of segments) {
    const stepIdx = seg.indexOf('/')
    const base = stepIdx >= 0 ? seg.slice(0, stepIdx) : seg
    const step = stepIdx >= 0 ? Number(seg.slice(stepIdx + 1)) : 1
    if (step < 1) return false

    if (base === '*') continue

    const dashIdx = base.indexOf('-')
    if (dashIdx >= 0) {
      const lo = Number(base.slice(0, dashIdx))
      const hi = Number(base.slice(dashIdx + 1))
      if (isNaN(lo) || isNaN(hi)) return false
      if (lo < min || lo > max || hi < min || hi > max || lo > hi) return false
    } else {
      const n = Number(base)
      if (isNaN(n) || n < min || n > max) return false
    }
  }
  return true
}

function validateCron(fields: CronFields): boolean {
  return validateField(fields.minute, 0, 59)
    && validateField(fields.hour, 0, 23)
    && validateField(fields.dayOfMonth, 1, 31)
    && validateField(fields.month, 1, 12)
    && validateField(fields.dayOfWeek, 0, 7)
}

function isSimpleNumber(val: string): boolean {
  return /^\d+$/.test(val)
}

function shiftDow(val: string, shift: number): string {
  return val.split(',').map((v) => {
    const dashIdx = v.indexOf('-')
    if (dashIdx >= 0) {
      const lo = Number(v.slice(0, dashIdx))
      const hi = Number(v.slice(dashIdx + 1))
      const loNorm = lo === 7 ? 0 : lo
      const hiNorm = hi === 7 ? 0 : hi
      return `${(loNorm + shift) % 7}-${(hiNorm + shift) % 7}`
    }
    const n = v === '7' ? 0 : Number(v)
    return String((n + shift) % 7)
  }).join(',')
}

function shiftDom(val: string, shift: number): string {
  return val.split(',').map((v) => {
    const dashIdx = v.indexOf('-')
    if (dashIdx >= 0) {
      const lo = Number(v.slice(0, dashIdx))
      const hi = Number(v.slice(dashIdx + 1))
      return `${lo + shift}-${hi + shift}`
    }
    return String(Number(v) + shift)
  }).join(',')
}

function applyTzOffset(fields: CronFields, offset: number): CronFields {
  const result = { ...fields }

  if (fields.hour === '*') return result

  if (!isSimpleNumber(fields.hour)) {
    return result
  }

  const hour = Number(fields.hour)
  const newHour = (hour + offset) % 24
  const dayShift = hour + offset >= 24 ? 1 : hour + offset < 0 ? -1 : 0

  result.hour = String(newHour)

  if (dayShift > 0) {
    if (fields.dayOfWeek !== '*' && fields.dayOfWeek !== '?') {
      result.dayOfWeek = shiftDow(fields.dayOfWeek, dayShift)
    }
    if (fields.dayOfMonth !== '*' && fields.dayOfMonth !== '?' && !fields.dayOfMonth.includes('L') && !fields.dayOfMonth.includes('W')) {
      result.dayOfMonth = shiftDom(fields.dayOfMonth, dayShift)
    }
  }

  return result
}

function isWildcard(v: string): boolean {
  return v === '*' || v === '?'
}

function describeMinute(minute: string): string {
  if (isWildcard(minute)) return '每分钟'
  if (minute.startsWith('*/')) {
    return `每${minute.slice(2)}分钟`
  }
  return ''
}

function describeHour(hour: string): string {
  if (isWildcard(hour)) return ''
  if (hour.includes(',')) {
    return hour.split(',').map(h => `${h}点`).join('、')
  }
  if (hour.includes('-')) {
    const [lo, hi] = hour.split('-')
    return `${lo}点至${hi}点`
  }
  return `${hour}点`
}

function describeDayOfWeek(dayOfWeek: string): string {
  if (isWildcard(dayOfWeek) || dayOfWeek === '?') return ''
  if (dayOfWeek.includes(',')) {
    const days = dayOfWeek.split(',').map((d) => {
      const n = Number(d)
      return `周${WEEKDAY_CN[n]}`
    }).join('、')
    return `每${days}`
  }
  if (dayOfWeek.includes('-')) {
    const [lo, hi] = dayOfWeek.split('-')
    return `每周${WEEKDAY_CN[Number(lo)]}至周${WEEKDAY_CN[Number(hi)]}`
  }
  return `每周${WEEKDAY_CN[Number(dayOfWeek)]}`
}

function describeDayOfMonth(dayOfMonth: string): string {
  if (isWildcard(dayOfMonth) || dayOfMonth === '?') return ''
  if (dayOfMonth.includes(',')) {
    return '每月' + dayOfMonth.split(',').map(d => `${d}日`).join('、')
  }
  if (dayOfMonth.includes('-')) {
    const [lo, hi] = dayOfMonth.split('-')
    return `每月${lo}日至${hi}日`
  }
  if (dayOfMonth.startsWith('*/')) {
    return `每${dayOfMonth.slice(2)}日`
  }
  return `每月${dayOfMonth}日`
}

function describeMonth(month: string): string {
  if (isWildcard(month)) return ''
  if (month.includes(',')) {
    return month.split(',').map(m => `${m}月`).join('、')
  }
  return `${month}月`
}

function toChinese(fields: CronFields): string {
  const minDesc = describeMinute(fields.minute)
  const hourDesc = describeHour(fields.hour)
  const dowDesc = describeDayOfWeek(fields.dayOfWeek)
  const domDesc = describeDayOfMonth(fields.dayOfMonth)
  const monthDesc = describeMonth(fields.month)

  // 每分钟 / 每N分钟（无其他限制条件）
  if (minDesc && isWildcard(fields.hour) && isWildcard(fields.dayOfMonth) && isWildcard(fields.month) && isWildcard(fields.dayOfWeek)) {
    return minDesc
  }

  if (!hourDesc) return '无效表达式'

  const scheduleParts: string[] = []

  if (monthDesc) scheduleParts.push(monthDesc)
  if (domDesc) scheduleParts.push(domDesc)
  if (dowDesc) {
    scheduleParts.push(dowDesc)
  }

  let timeStr: string
  if (fields.minute === '0') {
    timeStr = hourDesc
  } else if (isWildcard(fields.minute)) {
    timeStr = `${hourDesc}每分钟`
  } else {
    timeStr = `${hourDesc}:${pad(Number(fields.minute))}`
  }

  if (scheduleParts.length === 0) {
    return `每天 ${timeStr}`
  }

  return `${scheduleParts.join(' ')} ${timeStr}`
}

export const cronToCn = (val: string | undefined | null, tzOffset: number = 8): string | null => {
  if (!val?.trim()) return null

  const fields = parseFields(val)
  if (!fields) return null
  if (!validateCron(fields)) return null

  const localFields = applyTzOffset(fields, tzOffset)
  return toChinese(localFields)
}
