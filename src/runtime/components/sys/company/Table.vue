<script setup lang="ts">
import { useOverlay } from '@nuxt/ui/composables'
import { useCompanyApi } from '#v/composables'
import SysCompaniesSaveModal from './SaveModal.vue'
import { getOprColumns } from '#v/constants'
import TablePage from '#v/components/table/Page.vue'
import type { VColumn, Company } from '#v/types'

const overlay = useOverlay()
const saveModal = overlay.create(SysCompaniesSaveModal)

const columns: VColumn<Company>[] = [
  {
    accessorKey: 'fullname',
    header: '公司全称',
    meta: {
      class: {
        td: 'w-300'
      }
    },
    sortOption: true,
    filterOption: {
      type: 'input',
      initHide: false
    }
  },
  {
    accessorKey: 'nickname',
    header: '公司简称',
    meta: {
      class: {
        td: 'w-300'
      }
    },
    sortOption: true,
    filterOption: {
      type: 'input',
      initHide: false
    }
  },
  ...getOprColumns()
]
</script>

<template>
  <TablePage
    name="companies"
    cn-name="公司信息"
    :use-api-group="useCompanyApi"
    :biz-columns="columns"
    :extra-order-query-options="[
      { field: 'createdAt', label: '创建时间', defaultOpr: 'desc' }
    ]"
    :display-fn-in-delete-modal="model => model.fullname"
    @edit-row-from-modal="async (row: Company) => await saveModal.open({ model: row }).result"
  />
</template>
