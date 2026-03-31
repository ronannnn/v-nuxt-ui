import { createSharedComposable } from '@vueuse/core'
import { useApi } from '../useApi'

export const useCompanyApi = createSharedComposable(() => useApi<Model.Company>('/companies'))
