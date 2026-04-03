<script setup lang="ts">
import type { VColumn, Company } from 'v-nuxt-ui/types'
import { useOverlay } from '@nuxt/ui/composables'
import { useCompanyApi } from '#v/composables'
import SysCompaniesCreateModal from './CreateModal.vue'
import { getOprColumns } from '#v/constants'
import TablePage from '#v/components/table/Page.vue'

const overlay = useOverlay()
const createModal = overlay.create(SysCompaniesCreateModal)

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
    name="sys-company"
    cn-name="公司信息"
    :use-api-group="useCompanyApi"
    :biz-columns="columns"
    :extra-order-query-options="[
      { field: 'createdAt', label: '创建时间', defaultOpr: 'desc' }
    ]"
    @edit-row-from-modal="async (row: Company) => await createModal.open({ model: row }).result"
  />
</template>
