<script setup lang="ts">
import { computed } from 'vue'
import { useColorMode } from '@vueuse/core'

const props = defineProps<{
  /** Tailwind 颜色名 (e.g. 'red', 'blue')，空字符串表示默认 */
  chip?: string
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

const backgroundStyle = computed(() => {
  if (!props.chip || props.chip === 'primary') return undefined
  const shade = props.shade ?? (colorMode.value === 'dark' ? 400 : 500)
  return `background-color: var(--color-${props.chip}-${shade})`
})
</script>

<template>
  <button
    type="button"
    class="w-3 h-3 rounded-full transition-transform transition-shadow flex items-center justify-center shrink-0"
    :class="[
      selected
        ? 'ring-2 ring-primary ring-offset-2 ring-offset-[var(--ui-bg)] scale-110'
        : 'hover:scale-110 hover:ring-1 hover:ring-muted'
    ]"
    :style="backgroundStyle"
    :title="title"
    @click="$emit('click')"
  >
    <template v-if="!chip || chip === 'primary'">
      <span class="relative w-full h-full flex items-center justify-center">
        <span class="absolute w-3 h-3 rounded-full border-2 border-muted" />
        <span class="absolute w-[1px] h-3 bg-muted rotate-45" />
      </span>
    </template>
  </button>
</template>
