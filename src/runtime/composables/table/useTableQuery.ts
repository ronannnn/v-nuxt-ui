import type { OrderQueryOption, WhereQueryOption, VColumn } from '../../types/components'
import type { OrderQuery, WhereQuery, WhereQueryItem, WhereQueryItemGroup } from '../../types'
import { noValueOprList } from '../../types'
import { defu } from 'defu'

export function useTableQuery<T>(props: {
  name: string
  bizColumns: VColumn<T>[]
  extraWhereQueryOptions?: WhereQueryOption<T>[]
  extraWhereQueryInitValues?: Partial<WhereQuery<T>>
  extraOrderQueryOptions?: OrderQueryOption<T>[]
}) {
  const { name, bizColumns, extraWhereQueryOptions, extraWhereQueryInitValues, extraOrderQueryOptions } = props

  // where query options and initial values
  const whereQueryOptions = computed<WhereQueryOption<T>[]>(() => {
    const options = (bizColumns as any)
      .filter((col: any) => col.filterOption)
      .map((col: any) => ({
        field: col.accessorKey as string,
        label: col.header as string,
        ...col.filterOption
      }))
    extraWhereQueryOptions?.forEach((option) => {
      options.unshift(option)
    })
    return options
  })

  const whereQueryInitValues = computed<WhereQuery<T>>(() => {
    const initValues: WhereQuery<T> = {
      items: whereQueryOptions.value
        .filter(option => (option.initValues !== undefined && option.initValues !== null) || option.initHide === false)
        .map(option => ({
          field: option.field,
          opr: option.defaultOpr ?? useTableOpr().getDefaultOprByType(option.type),
          value: option.initValues ?? null,
          custom: option.custom
        }))
    }
    return defu(initValues, extraWhereQueryInitValues ?? {})
  })

  // order query options and initial values
  const orderQueryOptions = computed<OrderQueryOption<T>[]>(() => {
    const options: OrderQueryOption<T>[] = bizColumns
      .filter(col => col.sortOption)
      .map(col => ({
        field: (col as any)['accessorKey'],
        label: col.header as string,
        defaultOpr: col.sortOption === true ? null : col.sortOption?.defaultOpr
      }))
    extraOrderQueryOptions?.forEach((option) => {
      options.push(option)
    })
    return options
  })

  const orderQueryInitValues = computed<OrderQuery<T>>(() => {
    return orderQueryOptions.value
      .filter(option => option.defaultOpr)
      .map(option => ({ field: option.field, order: option.defaultOpr ?? 'desc' }))
  })

  // local storage
  const initStorageColumns = computed<LocalStorage.Column[]>(() =>
    bizColumns.map(col => ({
      accessorKey: (col as any)['accessorKey'],
      fixed: 'unfixed',
      checked: !col.initHide
    }))
  )

  const localStgSettings = useLocalStorage<LocalStorage.TableSettings<T>>(`${name}-table-settings`, {
    columns: initStorageColumns.value,
    pageSize: 10,
    whereQuery: whereQueryInitValues.value,
    orderQuery: orderQueryInitValues.value
  })

  // where query state
  const whereQuery = computed<WhereQuery<T> | undefined>({
    get: () => localStgSettings.value.whereQuery ?? whereQueryInitValues.value,
    set: query => localStgSettings.value = { ...localStgSettings.value, whereQuery: query }
  })

  const whereQueryOpen = computed<boolean>({
    get: () => localStgSettings.value.whereQueryOpen ?? false,
    set: (open: boolean) => localStgSettings.value = { ...localStgSettings.value, whereQueryOpen: open }
  })

  // order query state
  const orderQuery = computed<OrderQuery<T>>({
    get: () => localStgSettings.value.orderQuery ?? [],
    set: query => localStgSettings.value = { ...localStgSettings.value, orderQuery: query }
  })

  // check if where query is empty
  const checkIfWhereQueryItemsValueEmpty = (items: WhereQueryItem<T>[]) => {
    const itemsWithOprNoValues = items.filter(item => noValueOprList.includes(item.opr))
    if (itemsWithOprNoValues.length > 0) {
      return false
    }
    return !items
      .filter(item => !noValueOprList.includes(item.opr))
      .some(item => item.value !== null && item.value !== undefined && item.value !== '')
  }

  const checkIfWhereQueryGroupsValueEmpty = (groups: WhereQueryItemGroup<T>[]) => {
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

  const isWhereQueryValueEmpty = computed(() => {
    return checkIfWhereQueryItemsValueEmpty(
      whereQuery.value?.items?.filter(query =>
        whereQueryOptions.value.find(option => option.field === query.field)
      ) ?? []
    ) && checkIfWhereQueryGroupsValueEmpty(whereQuery.value?.groups ?? [])
  })

  // prune where query (remove empty items)
  const pruneWhereQuery = (query: WhereQuery<T> | undefined) => {
    if (!query) return undefined
    const clonedQuery = cloneJson(query)
    const prunedItems = clonedQuery.items
      ?.filter((item) => {
        if (noValueOprList.includes(item.opr)) {
          return true
        } else {
          return item.value !== null && item.value !== undefined && item.value !== ''
        }
      })
      .map((item) => {
        const newItem = { ...item }
        delete (newItem as any).extraData
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

  return {
    whereQueryOptions,
    whereQueryInitValues,
    orderQueryOptions,
    orderQueryInitValues,
    initStorageColumns,
    localStgSettings,
    whereQuery,
    whereQueryOpen,
    orderQuery,
    isWhereQueryValueEmpty,
    pruneWhereQuery
  }
}
