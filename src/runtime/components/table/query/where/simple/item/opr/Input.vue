<script setup lang="ts" generic="T">
import { computed, useTemplateRef } from 'vue'
import { isEmptyString } from '#v/utils'
import type { WhereQueryItem } from '#v/types'

defineProps<{
  label: string | keyof T
  disabled?: boolean
  triggerFetching?: () => Promise<void>
}>()

const whereQueryItem = defineModel<WhereQueryItem<T>>('whereQueryItem', { required: true })

const queryValue = computed<string | undefined>({
  get() {
    return whereQueryItem.value.value
  },
  set(newValue) {
    if (isEmptyString(newValue)) {
      whereQueryItem.value = { ...whereQueryItem.value, value: null }
    } else {
      whereQueryItem.value = { ...whereQueryItem.value, value: newValue }
    }
  }
})

const input = useTemplateRef('input')

defineExpose({
  focus: () => {
    input.value?.inputRef?.focus()
  }
})
</script>

<template>
  <UInput
    v-if="!noValueOprList.includes(whereQueryItem.opr)"
    ref="input"
    v-model="queryValue"
    :placeholder="`请输入${label.toString()}`"
    :disabled="disabled"
    color="neutral"
    @keyup.enter="async () => {
      await triggerFetching?.()
    }"
  >
    <template v-if="queryValue?.length" #trailing>
      <UButton
        color="neutral"
        variant="link"
        size="sm"
        icon="i-lucide-circle-x"
        aria-label="Clear input"
        @click="() => {
          queryValue = ''
          input?.inputRef?.focus()
        }"
      />
    </template>
  </UInput>
</template>
