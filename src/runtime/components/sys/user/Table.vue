<script setup lang="ts">
import dayjs from 'dayjs'
import type { VColumn, User } from '#v/types'
import { useOverlay } from '@nuxt/ui/composables'
import { isEmptyString } from '#v/utils'
import { useDepartmentApi, useRoleApi, useUserApi } from '#v/composables'
import { booleanOptions, dateFormat, genderOptions } from '#v/constants'
import SysUsersSaveModal from './SaveModal.vue'
import UBadge from '@nuxt/ui/components/Badge.vue'
import TablePage from '#v/components/table/Page.vue'
import { h } from 'vue'

const overlay = useOverlay()
const saveModal = overlay.create(SysUsersSaveModal)

const columns: VColumn<User>[] = [
  {
    accessorKey: 'isResigned',
    header: '是否离职',
    sortOption: true,
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
      likeSearchFields: ['name'],
      labelField: 'name',
      valueField: 'id',
      multiple: true,
      initHide: false,
      defaultOpr: 'in'
    }
  },
  {
    accessorKey: 'supervisorId',
    header: '直属上级',
    sortOption: true,
    cell: ({ row }) => row.original.supervisor?.nickname,
    filterOption: {
      type: 'async-select',
      preferred: false,
      listApi: useUserApi().list,
      likeSearchFields: ['nickname'],
      labelField: 'nickname',
      valueField: 'id',
      multiple: true,
      defaultOpr: 'in'
    }
  },
  {
    accessorKey: 'roles',
    header: '权限角色',
    cell: ({ row }) => row.original.roles?.map(role => role.name).join(', '),
    filterOption: {
      type: 'async-select',
      preferred: false,
      initHide: true,
      listApi: useRoleApi().list,
      likeSearchFields: ['name'],
      labelField: 'name',
      valueField: 'id',
      multiple: true,
      defaultOpr: 'in'
    }
  },
  {
    accessorKey: 'username',
    header: '用户名',
    filterOption: {
      type: 'input'
    },
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
    }
  },
  {
    accessorKey: 'email',
    header: '邮箱',
    filterOption: {
      type: 'input',
      initHide: true
    }
  },
  {
    accessorKey: 'needFillWh',
    header: '工时填报'
  },
  {
    accessorKey: 'gender',
    header: '性别',
    filterOption: {
      type: 'select',
      items: genderOptions,
      multiple: true,
      empty: {
        label: '未知',
        variant: 'outline',
        color: 'neutral'
      }
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
    filterOption: {
      type: 'date-picker',
      preferred: false,
      initHide: true
    },
    cell: ({ row }) => dayjs(row.getValue('entryDate')).format(dateFormat)
  },
  {
    accessorKey: 'resignDate',
    header: '离职时间',
    filterOption: {
      type: 'date-picker',
      preferred: false,
      initHide: true
    },
    sortOption: true,
    cell: ({ row }) => dayjs(row.getValue('resignDate')).format(dateFormat)
  },
  {
    accessorKey: 'telNo',
    header: '电话',
    filterOption: {
      type: 'input',
      initHide: true
    },
    meta: {
      class: {
        td: 'min-w-24'
      }
    }
  },
  {
    accessorKey: 'isAdmin',
    header: '系统管理员',
    sortOption: true,
    filterOption: {
      type: 'select',
      items: booleanOptions,
      preferred: false,
      initHide: true
    }
  }
]
</script>

<template>
  <TablePage
    name="users"
    cn-name="用户信息"
    :use-api-group="useUserApi"
    :biz-columns="columns"
    :extra-order-query-options="[
      { field: 'createdAt', label: '创建时间', defaultOpr: 'desc' }
    ]"
    :display-fn-in-delete-modal="model => model.nickname"
    :export-excel="{
      filename: '用户列表',
      filenameWithDateTime: true,
      permissionKey: 'user-export'
    }"
    @edit-row-from-modal="async (row: User) => await saveModal.open({ model: row }).result"
  />
</template>
