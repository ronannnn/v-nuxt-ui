import { createSharedComposable } from '@vueuse/core'
import { useApi } from '../useApi'
import type { JobTitle } from '#v/types'

export const useJobTitleApi = createSharedComposable(() => useApi<JobTitle>('/job-titles'))
