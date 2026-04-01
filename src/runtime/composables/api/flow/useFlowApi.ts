import { createSharedComposable } from '@vueuse/core'
import { useApi } from '../useApi'

export const useFlowApi = createSharedComposable(() => useApi<Model.Flow>('/flows'))
