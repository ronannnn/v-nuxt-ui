<script setup lang="ts">
import dayjs from 'dayjs'
import type { VColumn, User } from 'v-nuxt-ui/types'
import { useOverlay } from '@nuxt/ui/composables'
import { isEmptyString } from '#v/utils'
import { useDepartmentApi, useUserApi } from '#v/composables'
import { booleanOptions, dateFormat, genderOptions, loginTypeOptions } from '#v/constants'
import SysUsersCreateModal from './CreateModal.vue'
import UBadge from '@nuxt/ui/components/Badge.vue'
import TablePage from '#v/components/table/Page.vue'
import { h } from 'vue'

const overlay = useOverlay()
const createModal = overlay.create(SysUsersCreateModal)

const columns: VColumn<User>[] = [
  {
    accessorKey: 'isResigned',
    header: '是否离职',
    sortOption: true,
    filterOption: {
      type: 'input',
      initHide: false
    },
    cell: ({ row }) => h(
      UBadge,
      {
        label: isEmptyString(row.original.resignDate) ? '否' : '是',
        variant: 'soft',
        color: isEmptyString(row.original.resignDate) ? 'neutral' : 'error'
      }
    )
  },
  {
    accessorKey: 'nickname',
    header: '姓名',
    sortOption: true,
    filterOption: {
      type: 'input',
      initHide: false
    }
  },
  {
    accessorKey: 'departmentId',
    header: '部门',
    sortOption: true,
    cell: ({ row }) => row.original.department?.name,
    filterOption: {
      type: 'async-select',
      listApi: useDepartmentApi().list,
      searchFields: ['name'],
      labelField: 'name',
      multiple: true,
      defaultOpr: 'in'
    }
  },
  {
    accessorKey: 'supervisorId',
    header: '直属上级',
    sortOption: true,
    cell: ({ row }) => row.original.supervisor?.nickname
  },
  {
    accessorKey: 'roles',
    header: '系统权限角色',
    cell: ({ row }) => row.original.roles?.map(role => role.name).join(', ')
  },
  {
    accessorKey: 'username',
    header: '用户名',
    meta: {
      class: {
        td: 'min-w-24'
      }
    }
  },
  {
    accessorKey: 'loginType',
    header: '登录方式',
    meta: {
      class: {
        td: 'min-w-24'
      }
    },
    cell: ({ row }) => {
      const loginTypes = row.original.loginType?.split(',')
      return h(
        'div',
        { class: 'flex flex-wrap items-center gap-1' },
        [loginTypes?.map(loginType => h(UBadge, { variant: 'outline' }, () => loginTypeOptions.find(opt => opt.value === loginType)?.label as string))]
      )
    }
  },
  {
    accessorKey: 'email',
    header: '邮箱'
  },
  {
    accessorKey: 'needFillWh',
    header: '是否需要填写工时',
    filterOption: {
      type: 'select',
      items: booleanOptions
    }
  },
  {
    accessorKey: 'gender',
    header: '性别',
    filterOption: {
      type: 'select',
      items: genderOptions
    },
    meta: {
      class: {
        td: 'min-w-16'
      }
    }
  },
  {
    accessorKey: 'entryDate',
    header: '入职时间',
    sortOption: true,
    cell: ({ row }) => dayjs(row.getValue('entryDate')).format(dateFormat)
  },
  {
    accessorKey: 'resignDate',
    header: '离职时间',
    sortOption: true,
    cell: ({ row }) => dayjs(row.getValue('resignDate')).format(dateFormat)
  },
  {
    accessorKey: 'telNo',
    header: '电话',
    meta: {
      class: {
        td: 'min-w-24'
      }
    }
  },
  {
    accessorKey: 'isAdmin',
    header: '是否是系统管理员',
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
  }
]
</script>

<template>
  <TablePage
    name="sys-users"
    cn-name="用户信息"
    :use-api-group="useUserApi"
    :biz-columns="columns"
    :extra-order-query-options="[
      { field: 'createdAt', label: '创建时间', defaultOpr: 'desc' }
    ]"
    @edit-row-from-modal="async (row: User) => await createModal.open({ model: row }).result"
  />
</template>
