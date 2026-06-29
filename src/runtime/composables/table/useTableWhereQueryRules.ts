import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import { computed, toValue } from 'vue'
import type { WhereQuery, WhereQueryItem, WhereQueryItemGroup, WhereQueryOption } from '#v/types'
import { noValueOprList } from '#v/types'
import { cloneJson } from '#v/utils'

export function useTableWhereQueryRules<T>(props: {
  whereOptions: MaybeRefOrGetter<WhereQueryOption<T>[]>
  extraWhereQueryInitValues?: MaybeRefOrGetter<Partial<WhereQuery<T>> | undefined>
  normalizeItem?: (item: WhereQueryItem<T>) => WhereQueryItem<T>
}) {
  // 查询字段有两种来源：
  // 1. whereOptions：columns/filterOption 生成，展示在面板里，用户可以增删和清空内容。
  // 2. extraWhereQueryInitValues：调用方注入的固定条件，不展示在面板里，但本地查询必须始终保留。
  const whereOptionFieldSet = computed(() =>
    new Set(toValue(props.whereOptions).map(option => option.field as string))
  )

  function collectWhereQueryFields(items: WhereQueryItem<T>[] = [], groups: WhereQueryItemGroup<T>[] = []) {
    const fields = items.map(item => item.field as string)
    for (const group of groups) {
      fields.push(...collectWhereQueryFields(group.items, group.groups))
    }
    return fields
  }

  const fixedInitQuery = computed(() => cloneJson(toValue(props.extraWhereQueryInitValues) ?? {}))

  const extraWhereQueryInitFieldSet = computed(() =>
    new Set(collectWhereQueryFields(
      fixedInitQuery.value.items,
      fixedInitQuery.value.groups
    ))
  )

  function getFixedFieldKeys() {
    return Array.from(extraWhereQueryInitFieldSet.value)
  }

  function isValidWhereField(field: string | undefined) {
    return !!field && (whereOptionFieldSet.value.has(field) || extraWhereQueryInitFieldSet.value.has(field))
  }

  function hasExtraWhereQueryInitField(items: WhereQueryItem<T>[] = [], groups: WhereQueryItemGroup<T>[] = []) {
    return collectWhereQueryFields(items, groups).some(field => extraWhereQueryInitFieldSet.value.has(field))
  }

  function filterValidItems(items: WhereQueryItem<T>[] = []) {
    return items
      .filter(item => isValidWhereField(item.field as string))
      .map(item => props.normalizeItem?.(item) ?? item)
  }

  function filterValidGroups(groups: WhereQueryItemGroup<T>[] = []): WhereQueryItemGroup<T>[] {
    return groups
      .map((group) => {
        const items = filterValidItems(group.items)
        const childGroups = filterValidGroups(group.groups)
        return {
          ...group,
          items,
          groups: childGroups
        }
      })
      .filter(group => (group.items?.length ?? 0) > 0 || (group.groups?.length ?? 0) > 0)
  }

  function sanitizeWhereQuery(query: WhereQuery<T> | undefined): WhereQuery<T> {
    const fixedKeySet = extraWhereQueryInitFieldSet.value
    // 先丢弃本地历史里已失效的字段，再用当前 extra init 覆盖固定条件。
    // 这样 columns 或 extra 配置变化后，本地缓存不会继续带着旧查询污染请求。
    const fixedItems = filterValidItems(cloneJson(fixedInitQuery.value.items ?? []))
    const fixedGroups = filterValidGroups(cloneJson(fixedInitQuery.value.groups ?? []))
    const fixedGroupKeys = new Set(fixedGroups.map(group => JSON.stringify(group)))
    const nonFixedItems = filterValidItems(query?.items)
      .filter(item => !fixedKeySet.has(item.field as string))
    const nonFixedGroups = filterValidGroups(query?.groups)
      .filter(group => !hasExtraWhereQueryInitField(group.items, group.groups))

    return {
      ...query,
      items: [
        ...fixedItems,
        ...nonFixedItems
      ],
      groups: [
        ...fixedGroups,
        ...nonFixedGroups.filter(group => !fixedGroupKeys.has(JSON.stringify(group)))
      ]
    }
  }

  function isWhereQueryItemValueEmpty(item: WhereQueryItem<T>) {
    if (noValueOprList.includes(item.opr)) {
      return false
    }
    if (Array.isArray(item.value)) {
      return item.value.length === 0
    }
    return item.value === null || item.value === undefined || item.value === ''
  }

  function checkIfWhereQueryItemsValueEmpty(items: WhereQueryItem<T>[]) {
    return items.every(isWhereQueryItemValueEmpty)
  }

  function checkIfWhereQueryGroupsValueEmpty(groups: WhereQueryItemGroup<T>[]) {
    for (const group of groups) {
      if (!checkIfWhereQueryItemsValueEmpty(group.items ?? [])) {
        return false
      }
      if (!checkIfWhereQueryGroupsValueEmpty(group.groups ?? [])) {
        return false
      }
    }
    return true
  }

  function isUserWhereQueryValueEmpty(query: WhereQuery<T> | undefined) {
    const sanitizedQuery = sanitizeWhereQuery(query)
    // header 的 UChip 只表示用户可见查询是否有内容；隐藏固定条件不点亮 chip。
    const userItems = sanitizedQuery.items
      ?.filter(query => whereOptionFieldSet.value.has(query.field as string)) ?? []
    const userGroups = sanitizedQuery.groups
      ?.filter(group => !hasExtraWhereQueryInitField(group.items, group.groups)) ?? []

    return checkIfWhereQueryItemsValueEmpty(userItems) && checkIfWhereQueryGroupsValueEmpty(userGroups)
  }

  // prune where query：提交请求前移除空值和 UI-only 字段，但保留 no-value 操作符。
  function pruneWhereQuery(query: WhereQuery<T> | undefined): WhereQuery<T> | undefined {
    if (!query) return undefined
    const clonedQuery = cloneJson(sanitizeWhereQuery(query))
    const prunedItems = clonedQuery.items
      ?.filter((item) => {
        if (noValueOprList.includes(item.opr)) {
          return true
        }
        return item.value !== null && item.value !== undefined && item.value !== ''
      })
      .map((item) => {
        const newItem = { ...item }
        delete (newItem as any).extraData
        delete (newItem as any).whereQuerySection
        return newItem
      }) as WhereQueryItem<T>[]

    const prunedGroups = clonedQuery.groups?.map(group =>
      pruneWhereQuery({ items: group.items, groups: group.groups })
    ).filter(Boolean) as WhereQueryItemGroup<T>[]

    return {
      ...clonedQuery,
      items: prunedItems,
      groups: prunedGroups
    }
  }

  function createWhereQuerySnapshot(query: MaybeRefOrGetter<WhereQuery<T> | undefined>) {
    const items = filterValidItems(cloneJson(toValue(query)?.items ?? []))
    const groups = filterValidGroups(cloneJson(toValue(query)?.groups ?? []))
    const itemMap = new Map(items.map(item => [item.field as string, item]))
    return { items, groups, itemMap }
  }

  return {
    checkIfWhereQueryGroupsValueEmpty,
    checkIfWhereQueryItemsValueEmpty,
    collectWhereQueryFields,
    createWhereQuerySnapshot,
    extraWhereQueryInitFieldSet: extraWhereQueryInitFieldSet as ComputedRef<Set<string>>,
    filterValidGroups,
    filterValidItems,
    getFixedFieldKeys,
    hasExtraWhereQueryInitField,
    isUserWhereQueryValueEmpty,
    isValidWhereField,
    isWhereQueryItemValueEmpty,
    pruneWhereQuery,
    sanitizeWhereQuery,
    whereOptionFieldSet: whereOptionFieldSet as ComputedRef<Set<string>>
  }
}
