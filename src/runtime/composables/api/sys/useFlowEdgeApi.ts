import { createSharedComposable } from '@vueuse/core'
import { useApi } from '../useApi'
import type { FlowEdge } from '#v/types'

export const useFlowEdgeApi = createSharedComposable(() => useApi<FlowEdge>('/flows/edges'))
