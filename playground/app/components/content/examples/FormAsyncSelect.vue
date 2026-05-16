<script setup lang="ts">
import type { VFormFieldProps, ApiGroup } from '#v/types'
import { ref } from 'vue'

interface Department {
  id: number
  name: string
}

const departments = ref<Department[]>([
  { id: 1, name: '名字特别名字特别名字特别名字特别名字特别名字特别名字特别名字特别长的技术部' },
  { id: 2, name: '产品部' },
  { id: 3, name: '设计部' },
  { id: 4, name: '市场部' },
  { id: 5, name: '销售部' }
])

function mockListApi(params: { pagination?: { pageNum: number, pageSize: number }, whereQuery?: any }) {
  const query = params.whereQuery?.items?.[0]?.value ?? ''
  const filtered = departments.value.filter(d =>
    !query || d.name.includes(String(query))
  )
  return Promise.resolve({
    data: ref({
      error: null,
      data: { list: filtered, total: filtered.length }
    })
  })
}

const formData = ref({
  name: '',
  departmentId: undefined as number | undefined,
  departmentIds: [] as number[]
})

const selectedDepartment = ref<Department | undefined>()

const fields = computed<VFormFieldProps[]>(() => [
  {
    name: 'departmentId',
    label: '部门（单选）',
    type: 'async-select',
    labelField: 'name',
    valueField: 'id',
    likeSearchFields: ['name'],
    listApi: mockListApi as any,
    enableEmptyOption: true,
    initModel: selectedDepartment.value,
    onUpdateInitModel: (model: any) => {
      selectedDepartment.value = model
    },
    colSpan: '12'
  },
  {
    name: 'departmentIds',
    label: '部门（多选）',
    type: 'async-select',
    multiple: true,
    labelField: 'name',
    valueField: 'id',
    likeSearchFields: ['name'],
    listApi: mockListApi as any,
    colSpan: '12'
  }
] satisfies VFormFieldProps[])
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
