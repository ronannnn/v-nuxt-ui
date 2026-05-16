<script setup lang="ts" generic="T extends BaseModel">
import { toRef } from 'vue'
import { useFormSubmission, useFormValues } from '#v/composables/form/useForm'
import type { BaseModel, SaveModalFormTemplatePropsWithApi } from '#v/types'
import FormSaveModelTemplate from './index.vue'

const props = defineProps<SaveModalFormTemplatePropsWithApi<T>>()

const { oldValues, newValues } = useFormValues(toRef(props.modelValue), props.defaultModelValue)

const { onSubmit } = useFormSubmission(
  toRef(oldValues) as any,
  toRef(newValues) as any,
  props.onClose,
  props.onSave,
  props.apiGroup
)
</script>

<template>
  <FormSaveModelTemplate
    v-model:model-value="newValues"
    :old-model-value="oldValues"
    :title="title"
    :description="description"
    :on-close="onClose"
    :on-submit="onSubmit"
    :fields="fields"
  />
</template>
