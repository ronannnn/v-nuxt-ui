import type { UseFetchOptions } from '#app'
import type { ShowType } from '../types'

export function showTypeHeader(showType: ShowType): UseFetchOptions<any> {
  return { headers: { 'Show-Type': showType.toString() } }
}
