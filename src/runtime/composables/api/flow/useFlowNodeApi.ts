import { createSharedComposable } from '@vueuse/core'
import { useApi } from '../useApi'

export const useFlowNodeApi = createSharedComposable(() => useApi<Model.FlowNode>('/flows/nodes'))
