import { createSharedComposable } from '@vueuse/core'
import { useApi } from '../useApi'
import type { FlowNode } from '#v/types'

export const useFlowNodeApi = createSharedComposable(() => useApi<FlowNode>('/flows/nodes'))
