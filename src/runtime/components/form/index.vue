<script setup lang="ts" generic="T">
import type { FormTemplateProps } from '#v/types'
import { isEmptyString, getColSpanClassFromResponsive } from '#v/utils'
import { useTemplateRef, computed } from 'vue'
import FormField from './field/index.vue'
import * as z from 'zod'

const props = defineProps<FormTemplateProps<T>>()

const form = useTemplateRef('form')

const schema = computed(() => {
  const schemaObj: Record<string, z.ZodType> = {}
  props.fields
    .filter(field => !field.hidden && !field.disabled)
    .forEach((field) => {
      if (!field.name) {
        return
      }
      if (field.zodType) {
        schemaObj[field.name] = field.zodType
      }
      if (field.required === false) { // 这里不能用!field.required，undefined的情况不去设置optional
        schemaObj[field.name] = schemaObj[field.name]?.optional() ?? z.any().optional()
      }
    })
  return z.object(schemaObj)
})

const normFields = computed(() => props.fields
  .filter(field => !field.hidden)
  .map(field => ({
    ...field,
    required: field.required === undefined
      ? (field.zodType?.safeParse(undefined).success || field.disabled ? false : true)
      : field.required
  })))

defineExpose({
  validate: () => form.value?.validate({})
})

const onlyContentType = ['separator']
</script>

<template>
  <UForm
    ref="form"
    :schema="schema"
    :state="modelValue"
    :validate-on="['change']"
  >
    <div class="grid grid-cols-24 gap-3 sm:gap-4">
      <UFormField
        v-for="field in normFields"
        :key="field.name"
        :name="field.name"
        :label="field.label"
        :help="field.help"
        :required="field.required"
        :class="getColSpanClassFromResponsive(field.colSpan ?? '24')"
        :ui="{
          label: field.disabled ? 'text-dimmed flex items-center' : 'flex items-center'
        }"
      >
        <template v-if="!onlyContentType.includes(field.type)" #label>
          <span>{{ field.label }}</span>
          <UTooltip
            v-if="!isEmptyString(field.annotation)"
            :text="field.annotation"
            :ui="{ text: 'whitespace-pre-line', content: 'h-fit' }"
            :content="{ side: 'top' }"
          >
            <UIcon name="i-lucide-circle-question-mark" class="mx-px" />
          </UTooltip>
        </template>
        <FormField
          :field="field"
          :model-value="modelValue"
          @trigger-submit="onTriggerSubmit"
          @update:model-value="onUpdateModelValue"
        />
      </UFormField>
    </div>
  </UForm>
</template>
