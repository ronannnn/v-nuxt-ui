import { createSharedComposable } from '@vueuse/core'
import { useApi } from '../useApi'
import type { ApiGroup, Flow } from '#v/types'

export const useFlowApi = createSharedComposable((): ApiGroup<Flow> => ({
  ...useApi<Flow>('/flows')
}))
