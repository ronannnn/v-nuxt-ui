<script setup lang="ts">
import { UserCreateModal, UBadge } from '#components'
import type { RowActionProps, User, VColumn } from '#v/types'
import dayjs from 'dayjs'
import { useUserApi } from '#v/composables'

definePageMeta({
  layout: 'examples'
})

const overlay = useOverlay()
const createModal = overlay.create(UserCreateModal)

const genderOptions = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' }
]

const statusOptions = [
  { label: '在职', value: 'active', color: 'success' as const },
  { label: '离职', value: 'inactive', color: 'error' as const }
]

const booleanOptions = [
  { label: '是', value: true },
  { label: '否', value: false }
]

const columns: VColumn<User>[] = [
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
    accessorKey: 'username',
    header: '用户名',
    sortOption: true,
    filterOption: {
      type: 'input'
    }
  },
  {
    accessorKey: 'email',
    header: '邮箱',
    filterOption: {
      type: 'input'
    }
  },
  {
    accessorKey: 'gender',
    header: '性别',
    sortOption: true,
    filterOption: {
      type: 'select',
      items: genderOptions
    },
    cell: ({ row }) => h(
      UBadge,
      {
        variant: 'subtle',
        color: row.original.gender === 1 ? 'info' : 'warning'
      },
      () => row.original.gender === 1 ? '男' : '女'
    )
  },
  {
    accessorKey: 'departmentId',
    header: '部门',
    sortOption: true,
    cell: ({ row }) => row.original.department?.name ?? '-',
    filterOption: {
      type: 'async-select',
      listApi: useDepartmentApi().list,
      searchFields: ['name'],
      labelField: 'name',
      valueField: 'id',
      multiple: true,
      defaultOpr: 'in'
    }
  },
  {
    accessorKey: 'status',
    header: '状态',
    sortOption: true,
    filterOption: {
      type: 'select',
      items: statusOptions
    }
  },
  {
    accessorKey: 'isAdmin',
    header: '管理员',
    sortOption: true,
    filterOption: {
      type: 'select',
      items: booleanOptions
    },
    cell: ({ row }) => h(
      UBadge,
      {
        variant: 'soft',
        color: row.original.isAdmin ? 'primary' : 'neutral'
      },
      () => row.original.isAdmin ? '是' : '否'
    )
  },
  {
    accessorKey: 'telNo',
    header: '电话',
    cell: ({ row }) => row.original.telNo ?? '-'
  },
  {
    accessorKey: 'entryDate',
    header: '入职时间',
    sortOption: true,
    filterOption: {
      type: 'date-picker'
    },
    cell: ({ row }) => row.original.entryDate
      ? dayjs(row.original.entryDate).format('YYYY-MM-DD')
      : '-'
  },
  {
    accessorKey: 'createdAt',
    header: '创建时间',
    cell: ({ row }) => dayjs(row.original.createdAt).format(dateTimeFormat),
    filterOption: {
      type: 'date-picker'
    },
    sortOption: {
      defaultOpr: 'desc'
    }
  }
]

const toast = useToast()

const extraRowActions: RowActionProps<User>[] = [
  {
    label: '重置密码',
    icon: 'i-lucide-key-round',
    fn: (user) => {
      toast.add({
        title: '密码已重置',
        description: `用户 ${user.nickname} 的密码已重置为默认密码`,
        color: 'success',
        icon: 'i-lucide-check-circle'
      })
    }
  },
  {
    label: '禁用账户',
    icon: 'i-lucide-ban',
    color: 'warning',
    asyncFn: async (user) => {
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 500))
      toast.add({
        title: '账户已禁用',
        description: `用户 ${user.nickname} 的账户已被禁用`,
        color: 'warning',
        icon: 'i-lucide-triangle-alert'
      })
    }
  }
]

const expandVNode = (row: User) => {
  return h('div', { class: 'grid grid-cols-2 md:grid-cols-4 gap-4 p-4' }, [
    h('div', {}, [
      h('div', { class: 'text-xs text-muted mb-1' }, 'ID'),
      h('div', { class: 'font-mono text-sm' }, String(row.id))
    ]),
    h('div', {}, [
      h('div', { class: 'text-xs text-muted mb-1' }, '版本'),
      h('div', { class: 'font-mono text-sm' }, `v${row.version}`)
    ]),
    h('div', {}, [
      h('div', { class: 'text-xs text-muted mb-1' }, '创建人'),
      h('div', { class: 'text-sm' }, row.userCreatedBy ?? '-')
    ]),
    h('div', {}, [
      h('div', { class: 'text-xs text-muted mb-1' }, '更新人'),
      h('div', { class: 'text-sm' }, row.userUpdatedBy ?? '-')
    ]),
    h('div', {}, [
      h('div', { class: 'text-xs text-muted mb-1' }, '创建时间'),
      h('div', { class: 'text-sm' }, row.createdAt ? dayjs(row.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-')
    ]),
    h('div', {}, [
      h('div', { class: 'text-xs text-muted mb-1' }, '更新时间'),
      h('div', { class: 'text-sm' }, row.updatedAt ? dayjs(row.updatedAt).format('YYYY-MM-DD HH:mm:ss') : '-')
    ]),
    h('div', { class: 'col-span-2' }, [
      h('div', { class: 'text-xs text-muted mb-1' }, '邮箱'),
      h('div', { class: 'text-sm' }, row.email)
    ])
  ])
}
</script>

<template>
  <ProTablePage
    name="playground-users"
    cn-name="用户信息"
    :use-api-group="useUserApi"
    :biz-columns="columns"
    :on-edit-row-from-modal="async (row: User) => await createModal.open({ model: row }).result"
    :extra-row-actions="extraRowActions"
    expandable
    :expand-v-node="expandVNode"
    :export-excel="{
      filename: 'users-export',
      filenameWithDateTime: true
    }"
  />
</template>
