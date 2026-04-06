import { createSharedComposable } from '@vueuse/core'
import type { PageResult, Calendar, CalendarsSavePayload, ApiGroup, RequestResult } from '#v/types'
import { useApi, usePostFetch } from '../useApi'
import type { UseFetchOptions } from 'nuxt/app'
import type { Ref } from 'vue'

type CalendarApi = {
  batchSave: (payload: CalendarsSavePayload, customOptions?: UseFetchOptions<PageResult<Calendar>>) => Promise<{ data: Ref<RequestResult<PageResult<Calendar>>> }>
} & ApiGroup<Calendar>

export const useCalendarApi = createSharedComposable((): CalendarApi => ({
  ...useApi<Calendar>('/calendars'),
  batchSave: (payload: CalendarsSavePayload, customOptions: UseFetchOptions<PageResult<Calendar>> = {}) => {
    return usePostFetch<PageResult<Calendar>>(`/calendars/batch-save`, payload, customOptions)
  }
}))
