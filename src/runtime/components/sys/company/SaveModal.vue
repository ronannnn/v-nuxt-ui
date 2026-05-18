<script setup lang="ts">
import * as z from 'zod'
import FormSaveModalTemplateWithApi from '#v/components/form/save-modal-template/WithApi.vue'
import { useCompanyApi } from '#v/composables'
import type { Company } from '#v/types'

defineProps<{
  model: Company
}>()
const emit = defineEmits<{
  close: [boolean]
  save: [Company]
}>()
</script>

<template>
  <FormSaveModalTemplateWithApi
    title="公司信息"
    :on-close="ok => emit('close', ok)"
    :on-save="model => emit('save', model)"
    :fields="[
      { name: 'fullname', type: 'input', label: '公司全称', colSpan: '24', zodType: z.string().min(2, '名称字数不足') },
      { name: 'nickname', type: 'input', label: '公司简称', colSpan: '24', zodType: z.string().min(2, '名称字数不足') }
    ]"
    :model-value="model"
    :api-group="useCompanyApi"
  />
</template>
