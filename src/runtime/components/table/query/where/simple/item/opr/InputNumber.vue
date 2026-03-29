<script setup lang="ts" generic="T">
import { noValueOprList, type WhereQueryItem } from '../../../../../../../types'
import { computed, useTemplateRef } from 'vue'

defineProps<{
  label: string | keyof T
  disabled?: boolean
  triggerFetching?: () => Promise<void>
}>()

const whereQueryItem = defineModel<WhereQueryItem<T>>('whereQueryItem', { required: true })

const queryValue = computed<number | null>({
  get() {
    return whereQueryItem.value.value
  },
  set(newValue) {
    if (!newValue) {
      whereQueryItem.value = { ...whereQueryItem.value, value: null }
    } else {
      whereQueryItem.value = { ...whereQueryItem.value, value: newValue }
    }
  }
})

const input = useTemplateRef('input')

defineExpose({
  focus: () => {
    input.value?.inputRef.focus()
  }
})
</script>

<template>
  <UInputNumber
    v-if="!noValueOprList.includes(whereQueryItem.opr)"
    ref="input"
    v-model="queryValue"
    :placeholder="`请输入${label.toString()}`"
    :disabled="disabled"
    color="neutral"
    :increment="false"
    :decrement="false"
    class="max-w-16"
    @keyup.enter="async () => {
      await triggerFetching?.()
    }"
  />
</template>
