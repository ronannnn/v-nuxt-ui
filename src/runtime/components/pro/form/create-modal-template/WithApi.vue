<script setup lang="ts" generic="T extends Model.BaseModel">
import type { CreateModalFormTemplatePropsWithApi } from '../../../../types'

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
  <ProFormCreateModalTemplate
    v-model:model-value="newValues"
    :title="title"
    :description="description"
    :on-close="onClose"
    :on-submit="onSubmit"
    :fields="fields"
  />
</template>
