import { createSharedComposable } from '@vueuse/core'
import { useApi } from '../useApi'
import type { IssueRecord } from '#v/types'

export const useIssueRecordApi = createSharedComposable(() => useApi<IssueRecord>('/sys/issues'))
