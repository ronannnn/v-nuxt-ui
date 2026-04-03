<script setup lang="ts">
import type { JobTitle } from 'v-nuxt-ui/types'
import * as z from 'zod'
import FormCreateModalTemplateWithApi from '#v/components/form/create-modal-template/CreateModalTemplateFormWithApi.vue'
import { useJobTitleApi } from '#v/composables'

defineProps<{
  model: JobTitle
}>()
const emit = defineEmits<{
  close: [boolean]
  save: [JobTitle]
}>()
</script>

<template>
  <FormCreateModalTemplateWithApi
    title="职位信息"
    :on-close="ok => emit('close', ok)"
    :on-save="model => emit('save', model)"
    :fields="[
      { name: 'name', type: 'input', label: '名称', colSpan: '12', zodType: z.string().min(2, '名称字数不足') },
      { name: 'disabled', type: 'switch', colSpan: '12', label: '禁用' },
      { name: 'description', type: 'textarea', label: '描述', colSpan: '24', zodType: z.string().optional().nullable() },
      { name: 'remark', type: 'textarea', label: '备注', colSpan: '24', zodType: z.string().optional().nullable() }
    ]"
    :model-value="model"
    :default-model-value="{ disabled: false }"
    :api-group="useJobTitleApi"
  />
</template>
