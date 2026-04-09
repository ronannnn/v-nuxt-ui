<script setup lang="ts">
import { ref, watch, computed, useTemplateRef } from 'vue'
import type { InputProps } from '@nuxt/ui'
import { vMaska } from 'maska/vue'
import dayjs from 'dayjs'

withDefaults(defineProps<{
  placeholder?: InputProps['placeholder']
  size?: InputProps['size']
  icon?: InputProps['icon']
  inputClass?: string
}>(), {
  icon: 'i-lucide-calendar'
})

const value = defineModel<undefined | string>('value', { required: true })

const emit = defineEmits<{
  focus: [e: FocusEvent]
  blur: [e: FocusEvent]
}>()

const input = useTemplateRef('input')

// 本地输入缓冲区：保存用户正在输入的原始文本
const inputBuffer = ref(value.value ?? '')

// 从外部同步（日历点击、快捷方式等）
// 只在外部值真正变化时同步，避免覆盖用户正在输入的内容
let isInternalUpdate = false
watch(value, (newVal) => {
  if (isInternalUpdate) return
  inputBuffer.value = newVal ?? ''
})

// 判断输入是否为有效的完整日期
const isValidDate = (str: string): boolean => {
  if (!str || str.length < 10) return false
  return dayjs(str, 'YYYY-MM-DD', true).isValid()
}

// 是否需要错误高亮：有内容但不是有效日期
const isInvalid = computed(() => {
  const buf = inputBuffer.value
  if (!buf || buf.length === 0) return false
  return !isValidDate(buf)
})

// 处理输入变化
const onInput = () => {
  const buf = inputBuffer.value

  if (!buf || buf.length === 0) {
    // 清空了输入
    isInternalUpdate = true
    value.value = undefined
    isInternalUpdate = false
    return
  }

  if (isValidDate(buf)) {
    // 有效日期，同步到上游
    isInternalUpdate = true
    value.value = buf
    isInternalUpdate = false
  }
  // 无效/部分输入：不同步到上游，保持旧值
}

// 清空
const handleClear = () => {
  inputBuffer.value = ''
  isInternalUpdate = true
  value.value = undefined
  isInternalUpdate = false
  input.value?.inputRef?.focus()
}

defineExpose({
  focus: () => input.value?.inputRef?.focus()
})
</script>

<template>
  <UInput
    ref="input"
    v-model="inputBuffer"
    v-maska="'####-##-##'"
    size="sm"
    class="font-semibold"
    :class="inputClass"
    :icon="icon"
    :placeholder="placeholder"
    :color="isInvalid ? 'error' : 'neutral'"
    :highlight="isInvalid"
    @input="onInput"
    @focus="(e: FocusEvent) => emit('focus', e)"
    @blur="(e: FocusEvent) => emit('blur', e)"
  >
    <template v-if="inputBuffer?.length" #trailing>
      <UButton
        color="neutral"
        variant="link"
        size="sm"
        icon="i-lucide-circle-x"
        aria-label="Clear input"
        @mousedown.prevent
        @click="handleClear"
      />
    </template>
  </UInput>
</template>
