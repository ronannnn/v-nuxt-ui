<script setup lang="ts">
import * as z from 'zod'
import FormCreateModalTemplate from '#v/components/form/create-modal-template/index.vue'
import { useCompanyApi, useDepartmentApi, useFormSubmission, useFormValues, useUserApi } from '#v/composables'
import { toRef, watch } from 'vue'
import type { Department } from '#v/types'

const props = defineProps<{
  model: Department
}>()

const emit = defineEmits<{
  close: [boolean]
  save: [Department]
}>()

const { oldValues, newValues } = useFormValues(toRef(props.model), { id: 0 })
watch(
  () => newValues.value.parentId,
  () => {
    if (!newValues.value.companyId) {
      newValues.value.companyId = newValues.value.parent?.companyId
      newValues.value.company = newValues.value.parent?.company
    }
  }
)

const { onSubmit } = useFormSubmission(
  toRef(oldValues),
  toRef(newValues),
  close => emit('close', close),
  model => emit('save', model),
  useDepartmentApi
)
</script>

<template>
  <FormCreateModalTemplate
    title="部门信息"
    :on-close="ok => emit('close', ok)"
    :fields="[
      { name: 'name', type: 'input', label: '部门名称', colSpan: '12', zodType: z.string().min(2, '名称字数不足') },
      {
        name: 'parentId',
        label: '上级部门',
        colSpan: '12',
        type: 'async-tree-select',
        labelField: 'name',
        valueField: 'id',
        searchFields: ['name'],
        listApi: useDepartmentApi().list,
        fetchAll: true,
        initModelValues: newValues.parent,
        onUpdateInitModelValues: newInitModelValues => newValues.parent = newInitModelValues,
        zodType: z.number().min(0)
      },
      {
        name: 'companyId',
        label: '隶属公司',
        colSpan: '12',
        type: 'async-select',
        labelField: 'nickname',
        valueField: 'id',
        searchFields: ['nickname'],
        listApi: useCompanyApi().list,
        initModelValues: newValues.company,
        onUpdateInitModelValues: newInitModelValues => newValues.company = newInitModelValues,
        zodType: z.number().min(0)
      },
      {
        name: 'leaderId',
        label: '直属领导',
        colSpan: '12',
        type: 'async-select',
        labelField: 'nickname',
        valueField: 'id',
        searchFields: ['nickname'],
        listApi: useUserApi().list,
        initModelValues: newValues.leader,
        onUpdateInitModelValues: newInitModelValues => newValues.leader = newInitModelValues,
        zodType: z.number().min(0)
      }
    ]"
    :model-value="newValues"
    @update-model-value="newVal => newValues = { id: 0, ...newVal }"
    @submit="onSubmit"
  />
</template>
