import type { ShowType } from '#v/types'
import type { UseFetchOptions } from 'nuxt/app'

export function showTypeHeader(showType: ShowType): UseFetchOptions<any> {
  return { headers: { 'Show-Type': showType.toString() } }
}
