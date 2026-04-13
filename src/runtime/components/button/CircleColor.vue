<script setup lang="ts">
import { computed } from 'vue'
import { useColorMode } from '@vueuse/core'

const props = defineProps<{
  /** Tailwind 颜色名 (e.g. 'red', 'blue')，空字符串表示默认 */
  chip?: string
  /** 直接指定显示颜色的 CSS 值（优先于 chip），用于兼容旧数据 */
  colorOverride?: string
  /** 色阶 (默认 500) */
  shade?: number
  /** 是否选中 */
  selected?: boolean
  /** 标题提示 */
  title?: string
}>()

defineEmits<{
  click: []
}>()

const colorMode = useColorMode()

const bgColor = computed(() => {
  if (props.colorOverride) return props.colorOverride
  if (!props.chip) return undefined
  const shade = props.shade ?? (colorMode.value === 'dark' ? 400 : 500)
  return `var(--color-${props.chip}-${shade})`
})

const isDefault = computed(() => !props.chip && !props.colorOverride)
</script>

<template>
  <button
    class="w-4 h-4 rounded-full transition-all flex items-center justify-center shrink-0"
    :class="[
      selected
        ? 'ring-2 ring-primary ring-offset-2 ring-offset-[var(--ui-bg)] scale-110'
        : 'hover:scale-110 hover:ring-1 hover:ring-muted'
    ]"
    :style="bgColor ? { backgroundColor: bgColor } : {}"
    :title="title"
    @click="$emit('click')"
  >
    <!-- 默认色（无色块）：显示斜杠禁止图标 -->
    <template v-if="isDefault">
      <span class="relative w-full h-full flex items-center justify-center">
        <span class="absolute w-4 h-4 rounded-full border-2 border-muted" />
        <span class="absolute w-[1px] h-4 bg-muted rotate-45" />
      </span>
    </template>
  </button>
</template>
