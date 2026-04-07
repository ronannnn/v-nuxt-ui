import { createSharedComposable } from '@vueuse/core'
import { useApi } from './useApi'
import type { ApiGroup, Table } from '#v/types'

export const useTableApi = createSharedComposable((): ApiGroup<Table> => ({
  ...useApi<Table>('/tables')
}))
