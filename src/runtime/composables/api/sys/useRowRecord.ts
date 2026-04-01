import { createSharedComposable } from '@vueuse/core'
import { useApi, usePostFetch } from '../useApi'
import type { ApiGroup, PageResult, RequestResult, RowRecord, RowRecordPayload } from '#v/types'
import type { UseFetchOptions } from 'nuxt/app'
import type { Ref } from 'vue'

type RowRecordApiGroup = ApiGroup<RowRecord> & {
  getByTableNameAndRowId: (payload: RowRecordPayload, customOptions?: UseFetchOptions<PageResult<RowRecord>>) => Promise<{ data: Ref<RequestResult<PageResult<RowRecord>>> }>
}

export const useRowRecordApi = createSharedComposable((): RowRecordApiGroup => ({
  ...useApi<RowRecord>('/row-records'),
  getByTableNameAndRowId: (payload: RowRecordPayload, customOptions: UseFetchOptions<PageResult<RowRecord>> = {}) => {
    return usePostFetch<PageResult<RowRecord>>(`/row-records/biz`, payload, customOptions)
  }
}))
