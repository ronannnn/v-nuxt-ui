import { createSharedComposable } from '@vueuse/core'
import { useApi, usePostFetch, useGetFetch } from './useApi'
import type { ApiGroup, TableColumn, UserTableColumn, MergedTableColumn } from '#v/types'
import type { Ref } from 'vue'
import type { RequestResult } from '#v/types'

export const useTableColumnApi = createSharedComposable((): ApiGroup<TableColumn> & {
  getMergedColumns(tblName: string): Promise<{ data: Ref<RequestResult<MergedTableColumn[]>> }>
  saveUserColumns(tblName: string, configs: UserTableColumn[]): Promise<{ data: Ref<RequestResult<void>> }>
} => ({
  ...useApi<TableColumn>('/table-columns'),
  async getMergedColumns(tblName: string) {
    return useGetFetch<MergedTableColumn[]>(`/table-columns/merged?tblName=${encodeURIComponent(tblName)}`)
  },
  async saveUserColumns(tblName: string, configs: UserTableColumn[]) {
    return usePostFetch<void>('/table-columns/user-config', { tblName, configs })
  }
}))
