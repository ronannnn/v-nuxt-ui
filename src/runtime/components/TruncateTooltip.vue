<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, shallowRef, useTemplateRef, watch } from 'vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  text: string
  content?: Record<string, unknown>
  delayDuration?: number
}>(), {
  delayDuration: 0
})

const textRef = useTemplateRef<HTMLElement>('textRef')
const truncated = shallowRef(false)
let resizeObserver: ResizeObserver | null = null

function updateTruncated() {
  const el = textRef.value
  truncated.value = !!el && el.scrollWidth > el.clientWidth + 1
}

onMounted(async () => {
  await nextTick()
  updateTruncated()

  if (typeof ResizeObserver === 'undefined' || !textRef.value) return

  resizeObserver = new ResizeObserver(updateTruncated)
  resizeObserver.observe(textRef.value)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
})

watch(
  () => props.text,
  async () => {
    await nextTick()
    updateTruncated()
  }
)
</script>

<template>
  <UTooltip
    :disabled="!truncated"
    :delay-duration="delayDuration"
    :text="text"
    :content="content ?? { side: 'top' }"
  >
    <span
      ref="textRef"
      v-bind="$attrs"
      class="block w-full min-w-0 max-w-full truncate"
      @focus="updateTruncated"
      @pointerenter="updateTruncated"
    >
      {{ text }}
    </span>
  </UTooltip>
</template>
