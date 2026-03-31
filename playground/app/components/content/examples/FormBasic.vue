<script setup lang="ts">
import type { VFormFieldProps } from '#v/types'

const formData = ref({
  name: '',
  email: '',
  age: undefined as number | undefined,
  gender: '',
  bio: '',
  isAdmin: false
})

const fields = computed<VFormFieldProps<any>[]>(() => [
  {
    name: 'name',
    label: '姓名',
    type: 'input' as const,
    required: true,
    placeholder: '输入姓名',
    colSpan: '12'
  },
  {
    name: 'age',
    label: '年龄',
    type: 'input-number' as const,
    placeholder: '输入年龄',
    colSpan: '12'
  },
  {
    name: 'password',
    label: '密码',
    type: 'input-pwd' as const,
    placeholder: '输入密码',
    colSpan: '12'
  },
  {
    name: 'stringNumber',
    label: '字符串数字',
    type: 'input-string-number' as const,
    placeholder: '输入字符串数字',
    colSpan: '12'
  },
  {
    name: 'bio',
    label: '简介',
    type: 'textarea' as const,
    placeholder: '输入简介',
    colSpan: '24'
  },
  {
    name: 'gender',
    label: '性别',
    type: 'select' as const,
    items: [
      { label: '男', value: 'male' },
      { label: '女', value: 'female' }
    ],
    colSpan: '12'
  },
  {
    name: 'isAdmin',
    label: '管理员',
    type: 'switch' as const,
    colSpan: '12'
  },
  {
    name: 'isAdmin',
    label: '管理员',
    type: 'button-switch' as const,
    colSpan: '12'
  },
  {
    name: 'date',
    label: '日期',
    type: 'date-picker' as const,
    colSpan: '24'
  },
  {
    name: 'dynamic',
    label: '动态输入',
    type: 'dynamic-input' as const,
    colSpan: '24'
  }
] satisfies VFormFieldProps<any>[])
</script>

<template>
  <div class="space-y-4">
    <ProForm :fields="fields" :model-value="formData" @update:model-value="formData = $event" />

    <div>
      <p class="text-xs font-semibold mb-1">
        Form Data:
      </p>
      <pre class="text-xs bg-muted p-3 rounded overflow-auto font-mono">{{ JSON.stringify(formData, null, 2) }}</pre>
    </div>
  </div>
</template>
