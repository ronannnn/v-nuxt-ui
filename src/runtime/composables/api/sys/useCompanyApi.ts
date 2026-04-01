import { createSharedComposable } from '@vueuse/core'
import { useApi } from '../useApi'
import type { Company } from '#v/types'

export const useCompanyApi = createSharedComposable(() => useApi<Company>('/companies'))
