import { createSharedComposable } from '@vueuse/core'
import { useApi, useGetFetch } from './useApi'
import type { ApiGroup, TablePermission, EffectiveTablePermission } from '#v/types'
import type { Ref } from 'vue'
import type { RequestResult } from '#v/types'

export const useTablePermissionApi = createSharedComposable((): ApiGroup<TablePermission> & {
  getEffectivePermissions(tblName: string): Promise<{ data: Ref<RequestResult<EffectiveTablePermission>> }>
} => ({
  ...useApi<TablePermission>('/table-permissions'),
  async getEffectivePermissions(tblName: string) {
    return useGetFetch<EffectiveTablePermission>(`/table-permissions/effective?tblName=${encodeURIComponent(tblName)}`)
  }
}))
