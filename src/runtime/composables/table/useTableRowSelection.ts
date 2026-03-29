import { ref, watch, type Ref } from 'vue'

export function useTableRowSelection<T>(data: Ref<T[]>, rowKey: keyof T) {
  const rowSelection = ref<Record<number, boolean>>()
  const selectedIds = ref<number[]>([])

  watch(
    rowSelection,
    (newRowSelection) => {
      if (!newRowSelection) {
        selectedIds.value = []
        return
      }
      const filteredRowSelection = Object.entries(newRowSelection).filter(([_, selected]) => selected)
      selectedIds.value = filteredRowSelection.map(([idx]) => data.value[Number(idx)]?.[rowKey]) as number[]
    },
    { deep: true }
  )

  const clearRowSelection = () => {
    rowSelection.value = {}
    selectedIds.value = []
  }

  return {
    rowSelection,
    selectedIds,
    clearRowSelection
  }
}
