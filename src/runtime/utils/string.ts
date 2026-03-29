export function cloneJson<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

export function isEmptyString(str: string | null | undefined): boolean {
  return str === null || str === undefined || str.trim() === ''
}

export function onlyAllowNumberAndDot(value: string): boolean {
  return !value || /^[0-9]+(\.[0-9]+)?\.?$/.test(value)
}

export function filterNumberAndDot(value: string | null): string {
  return value!.replace(/[^\d.]/g, '')
}

export function uuid() {
  return crypto.randomUUID()
}

export function stringsJoin(arr: (string | undefined | null)[], separator = ', ') {
  return arr.filter(item => !isEmptyString(item)).join(separator)
}
