import { computed, ref, type Ref } from 'vue'
import type { DropdownMenuItem } from '@nuxt/ui'
import type { Pagination } from '#v/types'

const defaultPageSize: number = 10
const pageSizeOptions: number[] = [5, 10, 20, 50, 100]

export function useTablePagination(localStgSettings: Ref<LocalStorage.TableSettings<any>>) {
  const pageSize = computed<number>({
    get: () => localStgSettings.value.pageSize ?? defaultPageSize,
    set: pageSize => localStgSettings.value = { ...localStgSettings.value, pageSize }
  })

  const pagination = ref<Pagination>({
    pageNum: 1,
    pageSize: pageSize.value
  }) as Ref<Pagination>

  const pageSizeDropdownMenuItems = computed<DropdownMenuItem[]>(() =>
    pageSizeOptions.map(size => ({
      label: `${size} / 页`,
      value: size,
      type: 'checkbox',
      checked: pagination.value.pageSize === size,
      onSelect: () => {
        pagination.value.pageSize = size
        pageSize.value = size
      }
    }))
  )

  return {
    pagination,
    pageSizeDropdownMenuItems
  }
}
