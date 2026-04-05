<script setup lang="ts">
import type { VColumn, Role } from 'v-nuxt-ui/types'
import { useOverlay } from '@nuxt/ui/composables'
import { useRoleApi } from '#v/composables'
import SysRolesCreateModal from './CreateModal.vue'
import { getOprColumns } from '#v/constants'
import UBadge from '@nuxt/ui/components/Badge.vue'
import TablePage from '#v/components/table/Page.vue'
import { h } from 'vue'

const overlay = useOverlay()
const createModal = overlay.create(SysRolesCreateModal)

const columns: VColumn<Role>[] = [
  {
    accessorKey: 'name',
    header: '角色名称',
    sortOption: true,
    filterOption: {
      type: 'input',
      initHide: false
    }
  },
  {
    accessorKey: 'isAdmin',
    header: '是否是系统角色',
    sortOption: true,
    filterOption: {
      type: 'input',
      initHide: false
    },
    cell: ({ row }) => h(
      UBadge,
      {
        label: row.original.isAdmin ? '是' : '否',
        variant: 'soft',
        color: row.original.isAdmin ? 'primary' : 'neutral'
      }
    )
  },
  {
    accessorKey: 'disabled',
    header: '是否禁用',
    cell: ({ row }) => h(
      UBadge,
      {
        variant: 'soft',
        color: row.original.disabled ? 'error' : 'neutral'
      },
      () => row.original.disabled ? '是' : '否'
    )
  },
  {
    accessorKey: 'remark',
    header: '备注',
    filterOption: {
      type: 'input'
    }
  },
  ...getOprColumns()
]
</script>

<template>
  <TablePage
    name="sys-role"
    cn-name="角色信息"
    :use-api-group="useRoleApi"
    :biz-columns="columns"
    @edit-row-from-modal="async (row: Role) => await createModal.open({ model: row }).result"
  />
</template>
