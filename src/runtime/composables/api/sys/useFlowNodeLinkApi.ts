import { createSharedComposable } from '@vueuse/core'
import { useApi } from '../useApi'
import type { FlowNodeLink } from '#v/types'

export const useFlowNodeLinkApi = createSharedComposable(() => useApi<FlowNodeLink>('/flows/nodes/links'))
