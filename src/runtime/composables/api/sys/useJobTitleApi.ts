import { createSharedComposable } from '@vueuse/core'
import { useApi } from '../useApi'

export const useJobTitleApi = createSharedComposable(() => useApi<Model.JobTitle>('/job-titles'))
