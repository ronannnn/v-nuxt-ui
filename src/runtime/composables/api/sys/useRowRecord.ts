import { createSharedComposable } from '@vueuse/core'
import { useApi, usePostFetch } from '../useApi'
import type { PageResult } from '#v/types'
import type { UseFetchOptions } from 'nuxt/app'

export const useRowRecordApi = createSharedComposable(() => ({
  ...useApi<Model.RowRecord>('/row-records'),
  getByTableNameAndRowId: (payload: Cmd.RowRecordPayload, customOptions: UseFetchOptions<PageResult<Model.RowRecord>> = {}) => {
    return usePostFetch<PageResult<Model.RowRecord>>(`/row-records/biz`, payload, customOptions)
  }
}))
