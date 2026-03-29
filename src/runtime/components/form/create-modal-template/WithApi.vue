<script setup lang="ts" generic="T extends Model.BaseModel">
import { toRef } from 'vue'
import { useFormSubmission, useFormValues } from '#v/composables/useForm'
import type { CreateModalFormTemplatePropsWithApi } from '#v/types'
import FormCreateModalTemplate from './index.vue'

const props = defineProps<CreateModalFormTemplatePropsWithApi<T>>()

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
  <FormCreateModalTemplate
    v-model:model-value="newValues"
    :title="title"
    :description="description"
    :on-close="onClose"
    :on-submit="onSubmit"
    :fields="fields"
  />
</template>
