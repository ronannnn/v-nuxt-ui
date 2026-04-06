import { createSharedComposable } from '@vueuse/core'
import type { PageResult } from 'v-nuxt-ui/types'
import { useApi, usePostFetch } from '../useApi'
import type { UseFetchOptions } from 'nuxt/app'
import type { Calendar, CalendarsSavePayload } from '#v/types'

export const useCalendarApi = createSharedComposable(() => ({
  ...useApi<Calendar>('/calendars'),
  batchSave: (payload: CalendarsSavePayload, customOptions: UseFetchOptions<PageResult<Calendar>> = {}) => {
    return usePostFetch<PageResult<Calendar>>(`/calendars/batch-save`, payload, customOptions)
  }
}))
