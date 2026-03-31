<script setup lang="ts">
import type { VFormFieldProps } from '#v/types'

const props = defineProps<{
  model: Model.User
}>()

const emit = defineEmits<{
  close: [ok: boolean]
}>()

const genderOptions = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' }
]

const statusOptions = [
  { label: '在职', value: 'active' },
  { label: '离职', value: 'inactive' }
]

const isEdit = computed(() => props.model.id > 0)
const title = computed(() => isEdit.value ? '编辑用户' : '新建用户')

const fields: VFormFieldProps<Model.User>[] = [
  { name: 'nickname', label: '姓名', type: 'input', required: true, placeholder: '请输入姓名', colSpan: '12' },
  { name: 'username', label: '用户名', type: 'input', required: true, placeholder: '请输入用户名', colSpan: '12' },
  { name: 'email', label: '邮箱', type: 'input', placeholder: '请输入邮箱', colSpan: '12' },
  { name: 'telNo', label: '电话', type: 'input', placeholder: '请输入电话号码', colSpan: '12' },
  { name: 'gender', label: '性别', type: 'select', items: genderOptions, colSpan: '12' },
  { name: 'status', label: '状态', type: 'select', items: statusOptions, colSpan: '12' },
  {
    name: 'departmentId',
    label: '部门',
    type: 'async-select',
    listApi: useDepartmentApi().list as any,
    searchFields: ['name'],
    labelField: 'name',
    colSpan: '12'
  },
  { name: 'isAdmin', label: '系统管理员', type: 'switch', colSpan: '12' },
  { name: 'entryDate', label: '入职时间', type: 'date-picker', colSpan: '12' },
  { name: 'resignDate', label: '离职时间', type: 'date-picker', colSpan: '12' }
]
</script>

<template>
  <ProFormCreateModalTemplateWithApi
    :title="title"
    :fields="fields"
    :model-value="model"
    :api-group="useUserApi"
    @close="(ok: boolean) => emit('close', ok)"
    @save="(_user: Model.User) => emit('close', true)"
  />
</template>
