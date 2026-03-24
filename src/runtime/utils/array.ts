export function noDupPrimitiveArray(arr: any[]): any[] {
  return [...new Set(arr)]
}
