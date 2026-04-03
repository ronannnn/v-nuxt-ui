<script setup lang="ts">
import { useOverlay } from '@nuxt/ui/composables'
import { useMenuApi } from '#v/composables'
import type { VColumn, Menu } from 'v-nuxt-ui/types'
import SysMenusCreateModal from './CreateModal.vue'
import { getOprColumns } from '#v/constants'
import UBadge from '@nuxt/ui/components/Badge.vue'
import TablePage from '#v/components/table/Page.vue'
import { h } from 'vue'

const overlay = useOverlay()
const createModal = overlay.create(SysMenusCreateModal)

const columns: VColumn<Menu>[] = [
  {
    accessorKey: 'type',
    header: '菜单类型',
    cell: ({ row }) => {
      switch (row.original.type) {
        case 'catalog': return h(UBadge, {
          icon: 'i-lucide-folder',
          variant: 'subtle',
          color: 'neutral'
        }, {
          default: () => '目录'
        })
        case 'menu': return h(UBadge, {
          icon: 'i-lucide-menu',
          variant: 'subtle',
          color: 'primary'
        }, {
          default: () => '菜单'
        })
        case 'button': return h(UBadge, {
          icon: 'i-lucide-mouse-pointer-click',
          variant: 'subtle',
          color: 'warning'
        }, {
          default: () => '按钮'
        })
        default: return row.original.type
      }
    }
  },
  {
    accessorKey: 'isAdmin',
    header: '是否是系统菜单',
    sortOption: true,
    filterOption: {
      type: 'select',
      items: [
        { label: '是', value: true, color: 'primary' },
        { label: '否', value: false, color: 'neutral' }
      ],
      initHide: false
    }
  },
  { accessorKey: 'name', header: '菜单名称', filterOption: { type: 'input' }, sortOption: true },
  { accessorKey: 'staticRouteKeys', header: '静态路由键值', filterOption: { type: 'input' }, sortOption: true },
  {
    accessorKey: 'disabled',
    header: '是否禁用',
    filterOption: {
      type: 'select',
      items: [
        { label: '是', value: true, color: 'error' },
        { label: '否', value: false, color: 'neutral' }
      ]
    }
  },
  { accessorKey: 'permission', header: '权限标识', filterOption: { type: 'input' }, sortOption: true },
  { accessorKey: 'order', header: '排序', filterOption: { type: 'input' }, sortOption: true },
  ...getOprColumns(null)
]
</script>

<template>
  <TablePage
    name="sys-menu"
    cn-name="菜单信息"
    :use-api-group="useMenuApi"
    :biz-columns="columns"
    fetch-all
    :extra-order-query-options="[
      { field: 'order', label: '排序', defaultOpr: 'asc' }
    ]"
    treeify-col-name="parentId"
    :extra-row-actions="[{
      icon: 'i-lucide-clipboard-plus',
      label: '以此作为父菜单复制',
      fnWithModal: async raw => await createModal.open({ model: useMenuApi().copyAsParent?.(raw) ?? { id: 0 } }).result
    }]"
    @edit-row-from-modal="async (row: Menu) => await createModal.open({ model: row }).result"
  />
</template>
