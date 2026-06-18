import type { DropdownMenuItem } from '@nuxt/ui'
import type { WhereQuery, WhereQueryItem, WhereQueryItemGroup, WhereQueryOption, WhereQueryProps } from '#v/types'
import { cloneJson } from '#v/utils'
import { computed, reactive, ref, watch } from 'vue'
import { useTableOpr } from './useTableOpr'

export type WhereQuerySection = 'preferred' | 'other'

const rangeOprList = ['range_gt_lt', 'range_gt_lte', 'range_gte_lt', 'range_gte_lte']

export function useTableWhereQuery<T>(props: WhereQueryProps<T>) {
  const tableOpr = useTableOpr()

  // 字段合法性：whereOptions 是普通查询字段，extra init 允许保留调用方注入的固定条件。
  const whereOptionFieldSet = computed(() =>
    new Set(props.whereOptions.map(option => option.field as string))
  )

  function collectWhereQueryFields(items: WhereQueryItem<T>[] = [], groups: WhereQueryItemGroup<T>[] = []) {
    const fields = items.map(item => item.field as string)
    for (const group of groups) {
      fields.push(...collectWhereQueryFields(group.items, group.groups))
    }
    return fields
  }

  const extraWhereQueryInitFieldSet = computed(() =>
    new Set(collectWhereQueryFields(
      props.extraWhereQueryInitValues?.items,
      props.extraWhereQueryInitValues?.groups
    ))
  )

  function isValidWhereField(field: string | undefined) {
    return !!field && (whereOptionFieldSet.value.has(field) || extraWhereQueryInitFieldSet.value.has(field))
  }

  // 查询项规范化：字段还存在但 opr 已不适配当前类型时，回退到该类型默认 opr。
  function getDefaultOpr(option: WhereQueryOption<T>) {
    const nameMap = tableOpr.getOprNameMapByType(option.type)
    const typeDefaultOpr = tableOpr.getDefaultOprByType(option.type)
    if (option.defaultOpr && nameMap.has(option.defaultOpr)) return option.defaultOpr
    if (nameMap.has(typeDefaultOpr)) return typeDefaultOpr
    return option.defaultOpr ?? typeDefaultOpr
  }

  function createWhereQueryItemFromOption(option: WhereQueryOption<T>): WhereQueryItem<T> {
    return {
      field: option.field,
      opr: getDefaultOpr(option),
      value: option.initValues ?? null,
      custom: option.custom
    }
  }

  function normalizeWhereQueryItem(item: WhereQueryItem<T>) {
    const option = props.whereOptions.find(option => option.field === item.field)
    if (!option || option.type === 'custom' || option.type === 'unknown') return item
    if (tableOpr.getOprNameMapByType(option.type).has(item.opr)) return item

    return {
      ...item,
      opr: getDefaultOpr(option),
      value: null
    }
  }

  function filterValidItems(items: WhereQueryItem<T>[] = []) {
    return items
      .filter(item => isValidWhereField(item.field as string))
      .map(normalizeWhereQueryItem)
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

  const validWhereQueryItems = computed<WhereQueryItem<T>[]>(() =>
    filterValidItems(props.whereQuery?.items)
  )

  const validWhereQueryGroups = computed<WhereQueryItemGroup<T>[]>(() =>
    filterValidGroups(props.whereQuery?.groups)
  )

  watch([() => props.whereQuery, whereOptionFieldSet, extraWhereQueryInitFieldSet], () => {
    if (!props.whereQuery) return

    const currentItems = props.whereQuery.items ?? []
    const currentGroups = props.whereQuery.groups ?? []
    const items = filterValidItems(currentItems)
    const groups = filterValidGroups(currentGroups)
    const itemsChanged = items.length !== currentItems.length
    const groupsChanged = JSON.stringify(groups) !== JSON.stringify(currentGroups)

    if (!itemsChanged && !groupsChanged) return

    props.onUpdateWhereQuery({
      ...props.whereQuery,
      items,
      groups
    })
  }, { immediate: true })

  // 默认快照：defaultWhereQuery 用于恢复 init 值，extra init 用于固定条件保留。
  function createWhereQuerySnapshot(query: WhereQuery<T> | undefined) {
    const items = filterValidItems(cloneJson(query?.items ?? []))
    const groups = filterValidGroups(cloneJson(query?.groups ?? []))
    const itemMap = new Map(items.map(item => [item.field as string, item]))
    return { items, groups, itemMap }
  }

  const defaultQuery = computed(() => createWhereQuerySnapshot(props.defaultWhereQuery))
  const fixedInitQuery = computed(() => createWhereQuerySnapshot(props.extraWhereQueryInitValues))
  const getDefaultKeys = () => props.extraWhereQueryInitValues?.items?.map(query => query.field) ?? []

  function restoreInitItemValue(item: WhereQueryItem<T>): WhereQueryItem<T> {
    const initItem = defaultQuery.value.itemMap.get(item.field as string)
    if (!initItem) return item
    return {
      ...cloneJson(initItem),
      whereQuerySection: item.whereQuerySection
    }
  }

  function clearNonInitItemValue(item: WhereQueryItem<T>): WhereQueryItem<T> {
    const initItem = defaultQuery.value.itemMap.get(item.field as string)
    if (initItem) {
      return restoreInitItemValue(item)
    }
    return { ...item, value: null }
  }

  function mergeDefaultWhereQueryGroups(groups: WhereQueryItemGroup<T>[]) {
    const defaultGroupKeys = new Set(defaultQuery.value.groups.map(group => JSON.stringify(group)))
    return [
      ...defaultQuery.value.groups,
      ...groups.filter(group => !defaultGroupKeys.has(JSON.stringify(group)))
    ]
  }

  function updateWhereQueryWithInitValues(items: WhereQueryItem<T>[], groups = validWhereQueryGroups.value) {
    props.onUpdateWhereQuery({
      ...props.whereQuery,
      items,
      groups: mergeDefaultWhereQueryGroups(groups)
    })
  }

  // 字段列表：未选字段供“新增”菜单使用，分区由 preferred 决定。
  const selectedWhereFields = computed<string[]>(() =>
    validWhereQueryItems.value.map(query => query.field as string)
  )

  const unselectedWhereFields = computed<string[]>(() =>
    props.whereOptions.map(option => option.field as string).filter(field => !selectedWhereFields.value.includes(field))
  )

  const unselectedPreferredFields = computed<string[]>(() =>
    unselectedWhereFields.value.filter(field =>
      props.whereOptions.find(opt => opt.field === field)?.preferred !== false
    )
  )

  const unselectedOtherFields = computed<string[]>(() =>
    unselectedWhereFields.value.filter(field =>
      props.whereOptions.find(opt => opt.field === field)?.preferred === false
    )
  )

  const onNewField = (field: string) => {
    const option = props.whereOptions.find(option => option.field === field)
    if (!option || !option.type) return false

    props.onUpdateWhereQuery({
      ...props.whereQuery,
      items: [...validWhereQueryItems.value, createWhereQueryItemFromOption(option)],
      groups: validWhereQueryGroups.value
    })
    return true
  }

  const onRemoveFilter = (field: string) => {
    const updatedItems = validWhereQueryItems.value.filter(query => query.field !== field)
    props.onUpdateWhereQuery({
      ...props.whereQuery,
      items: updatedItems,
      groups: validWhereQueryGroups.value
    })
  }

  // 分区状态：extra init 条件不参与简单查询面板排序；whereQuerySection 只保存用户手动分区覆盖。
  const whereQueryWithoutInitValues = computed<WhereQueryItem<T>[]>(() => {
    if (!props.whereQuery) return []
    const defaultKeys = getDefaultKeys()
    return validWhereQueryItems.value.filter((query) => {
      const field = query.field as string
      return !defaultKeys.includes(field)
    })
  })

  function getBaseItemSection(item: WhereQueryItem<T>): WhereQuerySection {
    return props.whereOptions.find(opt => opt.field === item.field)?.preferred === false ? 'other' : 'preferred'
  }

  function getItemSection(item: WhereQueryItem<T>): WhereQuerySection {
    const section = item.whereQuerySection
    return section === 'preferred' || section === 'other' ? section : getBaseItemSection(item)
  }

  function isPreferredItem(item: WhereQueryItem<T>) {
    return getItemSection(item) === 'preferred'
  }

  function setItemSection(item: WhereQueryItem<T>, section: WhereQuerySection): WhereQueryItem<T> {
    if (section === getBaseItemSection(item)) {
      const { whereQuerySection: _omit, ...rest } = item
      return rest as WhereQueryItem<T>
    }
    return { ...item, whereQuerySection: section }
  }

  const preferredItems = computed<WhereQueryItem<T>[]>(() =>
    whereQueryWithoutInitValues.value.filter(isPreferredItem)
  )

  const otherItems = computed<WhereQueryItem<T>[]>(() =>
    whereQueryWithoutInitValues.value.filter(item => !isPreferredItem(item))
  )

  const preferredDndItems = ref<WhereQueryItem<T>[]>([])
  const otherDndItems = ref<WhereQueryItem<T>[]>([])

  watch([preferredItems, otherItems], () => {
    preferredDndItems.value = [...preferredItems.value]
    otherDndItems.value = [...otherItems.value]
  }, { immediate: true })

  function updateWhereQuerySections(preferred: WhereQueryItem<T>[], other: WhereQueryItem<T>[]) {
    const defaultKeys = getDefaultKeys()
    const initItems = validWhereQueryItems.value.filter(q => defaultKeys.includes(q.field as string))
    props.onUpdateWhereQuery({
      ...props.whereQuery,
      items: [
        ...initItems,
        ...preferred.map(item => setItemSection(item, 'preferred')),
        ...other.map(item => setItemSection(item, 'other'))
      ],
      groups: validWhereQueryGroups.value
    })
  }

  function onDndEnd() {
    updateWhereQuerySections(preferredDndItems.value, otherDndItems.value)
  }

  function onMoveItemSection(field: string, section: WhereQuerySection) {
    const currentPreferredItems = [...preferredDndItems.value]
    const currentOtherItems = [...otherDndItems.value]
    const sourceItems = section === 'preferred' ? currentOtherItems : currentPreferredItems
    const item = sourceItems.find(item => item.field === field)
    if (!item) return

    const nextPreferredItems = section === 'preferred'
      ? [...currentPreferredItems, item]
      : currentPreferredItems.filter(item => item.field !== field)
    const nextOtherItems = section === 'other'
      ? [...currentOtherItems, item]
      : currentOtherItems.filter(item => item.field !== field)

    preferredDndItems.value = nextPreferredItems
    otherDndItems.value = nextOtherItems
    updateWhereQuerySections(nextPreferredItems, nextOtherItems)
  }

  function onUpdateWhereQueryItem(field: string, newWhereQueryItem: WhereQueryItem<T>) {
    const items = validWhereQueryItems.value
    const realIdx = items.findIndex(query => query.field === field)
    if (realIdx === -1) return
    const currentItem = items[realIdx]
    if (!currentItem) return
    const currentSection = getItemSection(currentItem)
    const updatedItems = [...items]
    updatedItems[realIdx] = setItemSection(newWhereQueryItem, currentSection)
    props.onUpdateWhereQuery({
      ...props.whereQuery,
      items: updatedItems,
      groups: validWhereQueryGroups.value
    })
  }

  const sections = reactive([
    { key: 'preferred' as const, label: '常用查询条件', dndItems: preferredDndItems, unselectedFields: unselectedPreferredFields },
    { key: 'other' as const, label: '其他查询条件', dndItems: otherDndItems, unselectedFields: unselectedOtherFields }
  ])

  const empty = computed(() => sections.every(section => section.dndItems.length === 0))

  // 批量动作：清空只清值；恢复默认只补 visible 缺失字段；补全会加入所有可查询字段。
  const onClearValues = () => {
    if (!props.whereQuery?.items) return
    updateWhereQueryWithInitValues(validWhereQueryItems.value.map(clearNonInitItemValue))
  }

  function createMissingVisibleItems(currentFields: Set<string>): WhereQueryItem<T>[] {
    return props.whereOptions
      .filter(option => option.initHide !== true && !currentFields.has(option.field as string))
      .map((option) => {
        const defaultItem = defaultQuery.value.itemMap.get(option.field as string)
        return defaultItem ? cloneJson(defaultItem) : createWhereQueryItemFromOption(option)
      })
  }

  const onResetAll = () => {
    const currentItems = validWhereQueryItems.value
    const currentFields = new Set(currentItems.map(item => item.field as string))
    const missingItems = createMissingVisibleItems(currentFields)

    props.onUpdateWhereQuery({
      ...props.whereQuery,
      items: [...currentItems, ...missingItems],
      groups: validWhereQueryGroups.value
    })
  }

  const onFillMissingFields = () => {
    const currentItems = validWhereQueryItems.value.map(restoreInitItemValue)
    const currentFields = new Set(currentItems.map(item => item.field as string))
    const missingDefaultItems = defaultQuery.value.items.filter(item => !currentFields.has(item.field as string))
    missingDefaultItems.forEach(item => currentFields.add(item.field as string))

    const missingOptions = props.whereOptions.filter(opt => !currentFields.has(opt.field as string))
    if (missingDefaultItems.length === 0 && missingOptions.length === 0) {
      updateWhereQueryWithInitValues(currentItems)
      return
    }

    const preferred = missingOptions.filter(opt => opt.preferred !== false)
    const other = missingOptions.filter(opt => opt.preferred === false)

    const newItems = [...preferred, ...other].map(createWhereQueryItemFromOption)

    updateWhereQueryWithInitValues([...currentItems, ...missingDefaultItems, ...newItems])
  }

  const onRemoveAllFields = () => {
    props.onUpdateWhereQuery({
      ...props.whereQuery,
      items: fixedInitQuery.value.items,
      groups: fixedInitQuery.value.groups
    })
  }

  const moreActions = computed<DropdownMenuItem[]>(() => [
    { label: '补全全部字段', icon: 'i-lucide-list-plus', onSelect: onFillMissingFields },
    { label: '清空全部字段', icon: 'i-lucide-trash-2', onSelect: onRemoveAllFields }
  ])

  const isDateRangeQueryItem = (item: WhereQueryItem<T>) => {
    const option = props.whereOptions.find(option => option.field === item.field)
    return option?.type === 'date-picker' && rangeOprList.includes(item.opr as string)
  }

  return {
    empty,
    isDateRangeQueryItem,
    isValidWhereField,
    moreActions,
    onClearValues,
    onDndEnd,
    onMoveItemSection,
    onNewField,
    onRemoveFilter,
    onResetAll,
    onUpdateWhereQueryItem,
    sections,
    unselectedWhereFields
  }
}
