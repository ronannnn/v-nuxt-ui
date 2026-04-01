import type { ShowType } from '#v/types'
import type { UseFetchOptions } from 'nuxt/app'

export function showTypeHeader<T>(showType: ShowType): UseFetchOptions<T> {
  return { headers: { 'Show-Type': showType.toString() } }
}
