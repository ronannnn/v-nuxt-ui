import { ref, computed, watch, onMounted, type Ref, type ComputedRef } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import type { StatsItem, Pagination, WhereQuery, OrderQuery } from '#v/types'
import { useFetching } from '../useBoolean'
import { treeifyModels } from '#v/utils'

const defaultPageSize: number = 10

export function useTableData<T>(props: {
  name: string
  rowKey: keyof T
  apiListFn?: (...args: any[]) => any
  useApiGroup?: (...args: any[]) => any
  fetchAll?: boolean
  treeifyColName?: keyof T
  disableFetchOnMounted?: boolean
  pagination: Ref<Pagination>
  pruneWhereQuery: (query: WhereQuery<T> | undefined) => WhereQuery<T> | undefined
  whereQuery: ComputedRef<WhereQuery<T> | undefined>
  orderQuery: ComputedRef<OrderQuery<T>>
  clearRowSelection: () => void
}) {
  const {
    name,
    rowKey,
    apiListFn,
    useApiGroup,
    fetchAll,
    treeifyColName,
    disableFetchOnMounted,
    pagination,
    pruneWhereQuery,
    whereQuery,
    orderQuery,
    clearRowSelection
  } = props

  const apiGroup = useApiGroup?.()
  const data = ref<T[]>([]) as Ref<T[]>
  const stats = ref<StatsItem[][]>([]) as Ref<StatsItem[][]>

  const treeifyData = computed(() => {
    if (!treeifyColName) return []
    return treeifyModels(data.value, rowKey, treeifyColName, 0)
  })

  const createRow = (model: T) => data.value.unshift(model)

  const updateRow = (model: T) => {
    const index = data.value.findIndex(item => item[rowKey] === model[rowKey])
    if (index !== -1) {
      data.value[index] = model
    }
  }

  const deleteRow = (model: T) => {
    const index = data.value.findIndex(item => item[rowKey] === model[rowKey])
    if (index !== -1) {
      data.value.splice(index, 1)
    }
  }

  // CRUD operations
  const { fetching, startFetching, endFetching } = useFetching()
  const total = ref<number>(0)

  async function fetchList(fromStart: boolean = false) {
    if (!apiListFn && !apiGroup?.countAndList) {
      console.warn('No apiListFn or apiGroup.countAndList provided for table:', name)
      return
    }
    try {
      startFetching()
      const { data: fetchedData } = await (apiListFn ?? apiGroup?.countAndList)!({
        pagination: {
          pageNum: fromStart ? 1 : (pagination.value.pageNum ?? 1),
          pageSize: fetchAll ? 0 : (pagination.value.pageSize ?? defaultPageSize)
        },
        whereQuery: pruneWhereQuery(whereQuery.value),
        orderQuery: orderQuery.value
      })
      if (fetchedData.value?.data) {
        data.value = fetchedData.value.data.list
        total.value = fetchedData.value.data.total
        pagination.value.pageNum = fetchedData.value.data.pageNum
        pagination.value.pageSize = fetchedData.value.data.pageSize
        stats.value = fetchedData.value.data.stats || []
        clearRowSelection()
      }
    } finally {
      endFetching()
    }
  }

  const debouncedFetchList = useDebounceFn(fetchList, 512)

  // watch pagination changes
  watch(
    () => [pagination.value.pageNum, pagination.value.pageSize],
    async () => await fetchList()
  )

  // fetch on mounted
  onMounted(async () => {
    if (!disableFetchOnMounted) {
      await fetchList()
    }
  })

  return {
    data,
    treeifyData,
    stats,
    total,
    createRow,
    updateRow,
    deleteRow,
    fetching,
    fetchList,
    debouncedFetchList
  }
}
