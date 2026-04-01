import { createSharedComposable } from '@vueuse/core'
import { useApi } from '../useApi'

export const useFlowNodeLinkApi = createSharedComposable(() => useApi<Model.FlowNodeLink>('/flows/nodes/links'))
