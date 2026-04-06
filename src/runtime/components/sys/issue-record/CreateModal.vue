<script setup lang="ts">
import type { IssueRecord } from '#v/types'
import * as z from 'zod'
import FormCreateModalTemplateWithApi from '#v/components/form/create-modal-template/WithApi.vue'
import { useIssueRecordApi } from '#v/composables'

defineProps<{
  model: IssueRecord
}>()
const emit = defineEmits<{
  close: [boolean]
  save: [IssueRecord]
}>()
</script>

<template>
  <FormCreateModalTemplateWithApi
    title="改进建议"
    description="您可以针对该网页提出任何改进建议或直接联系chenrn@mail.veken.com"
    :on-close="ok => emit('close', ok)"
    :on-save="model => emit('save', model)"
    :fields="[
      { name: 'description', type: 'textarea', label: '描述', colSpan: '24', zodType: z.string() }
    ]"
    :model-value="model"
    :api-group="useIssueRecordApi"
  />
</template>
