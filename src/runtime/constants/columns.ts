import { useUserApi } from '#v/composables'
import type { BaseModel, OrderQueryOpr, VColumn } from '#v/types'
import dayjs from 'dayjs'
import { dateTimeFormat } from './time'

export const getCreateAtColumn = <T extends BaseModel>(createdAtSortOpr: OrderQueryOpr = 'desc'): VColumn<T> => ({
  accessorKey: 'createdAt',
  header: '创建时间',
  cell: ({ row }) => dayjs(row.original.createdAt).format(dateTimeFormat),
  filterOption: {
    type: 'date-picker'
  },
  sortOption: {
    defaultOpr: createdAtSortOpr
  }
})

export const getOprColumns = <T extends BaseModel>(createdAtSortOpr: OrderQueryOpr = 'desc'): VColumn<T>[] => [
  {
    accessorKey: 'createdBy',
    header: '创建人',
    cell: ({ row }) => row.original.creator?.nickname || '/',
    filterOption: {
      type: 'async-select',
      listApi: useUserApi().list,
      likeSearchFields: ['nickname'],
      labelField: 'nickname',
      valueField: 'id',
      multiple: true,
      defaultOpr: 'in'
    }
  },
  getCreateAtColumn<T>(createdAtSortOpr),
  {
    accessorKey: 'updatedBy',
    header: '更新人',
    cell: ({ row }) => row.original.updater?.nickname || '/',
    filterOption: {
      type: 'async-select',
      listApi: useUserApi().list,
      likeSearchFields: ['nickname'],
      labelField: 'nickname',
      valueField: 'id',
      multiple: true,
      defaultOpr: 'in'
    }
  },
  {
    accessorKey: 'updatedAt',
    header: '更新时间',
    cell: ({ row }) => dayjs(row.original.updatedAt).format(dateTimeFormat),
    filterOption: {
      type: 'date-picker'
    },
    sortOption: true
  }
]
