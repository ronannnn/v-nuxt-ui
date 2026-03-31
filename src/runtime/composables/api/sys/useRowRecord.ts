import { createSharedComposable } from '@vueuse/core'
import { useApi, usePostFetch } from '../useApi'
import type { ApiGroup, PageResult, RequestResult } from '#v/types'
import type { UseFetchOptions } from 'nuxt/app'
import type { Ref } from 'vue'

type RowRecordApiGroup = ApiGroup<Model.RowRecord> & {
  getByTableNameAndRowId: (payload: Cmd.RowRecordPayload, customOptions?: UseFetchOptions<PageResult<Model.RowRecord>>) => Promise<{ data: Ref<RequestResult<PageResult<Model.RowRecord>>> }>
}

export const useRowRecordApi = createSharedComposable((): RowRecordApiGroup => ({
  ...useApi<Model.RowRecord>('/row-records'),
  getByTableNameAndRowId: (payload: Cmd.RowRecordPayload, customOptions: UseFetchOptions<PageResult<Model.RowRecord>> = {}) => {
    return usePostFetch<PageResult<Model.RowRecord>>(`/row-records/biz`, payload, customOptions)
  }
}))
