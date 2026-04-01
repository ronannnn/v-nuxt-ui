import type { VColumn } from '../types'

export function isObject(value: unknown): value is object {
  return typeof value === 'object' && value !== null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>

/**
 * 将 VColumn<T>[] 安全地拓宽为 VColumn<AnyRecord>[]。
 *
 * VColumn<T> 内部依赖了 TanStack Table 的 ColumnDef<T>（不变泛型），
 * 导致 TypeScript 无法自动将 VColumn<SubType> 赋值给 VColumn<AnyRecord>，
 * 尽管在运行时两者完全兼容（T extends AnyRecord）。
 *
 * 此函数将类型拓宽集中在单一位置，避免在业务代码中散布 as unknown as ...。
 * 仅用于向不保留泛型的组件（如通过 useOverlay 打开的模态框）传递列数据。
 */
export function widenColumns<T extends AnyRecord>(columns: VColumn<T>[] | undefined): VColumn<AnyRecord>[] {
  return (columns ?? []) as VColumn<AnyRecord>[]
}
