<script setup lang="ts">
const formData = ref({
  name: '',
  email: '',
  age: undefined as number | undefined,
  gender: '',
  bio: '',
  isAdmin: false
})

const fields = computed(() => [
  {
    name: 'name',
    label: '姓名',
    type: 'input' as const,
    required: true,
    placeholder: 'Enter name',
    colSpan: 'col-span-12'
  },
  {
    name: 'email',
    label: '邮箱',
    type: 'input' as const,
    required: true,
    placeholder: 'Enter email',
    colSpan: 'col-span-12'
  },
  {
    name: 'age',
    label: '年龄',
    type: 'input-number' as const,
    placeholder: 'Enter age',
    colSpan: 'col-span-12'
  },
  {
    name: 'gender',
    label: '性别',
    type: 'select' as const,
    items: [
      { label: '男', value: 'male' },
      { label: '女', value: 'female' }
    ],
    colSpan: 'col-span-12'
  },
  {
    name: 'bio',
    label: '简介',
    type: 'textarea' as const,
    placeholder: 'Tell us about yourself',
    colSpan: 'col-span-24'
  },
  {
    name: 'isAdmin',
    label: '管理员',
    type: 'switch' as const,
    colSpan: 'col-span-24'
  }
])
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
