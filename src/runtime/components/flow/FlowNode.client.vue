<script setup lang="ts">
import { ref, computed, inject, onMounted, onBeforeUnmount } from 'vue'
import { Handle } from '@vue-flow/core'
import { FLOW_HANDLES, FLOW_MOUSE_POSITION_KEY } from '#v/constants'

const props = defineProps<{
  data: any
  selected?: boolean
}>()

const nodeRef = ref<HTMLElement | null>(null)
const isHoveredLocal = ref(false)
const PROXIMITY_THRESHOLD = 50

const injectedMousePosition = inject(FLOW_MOUSE_POSITION_KEY, null)
const localMousePosition = ref({ x: 0, y: 0 })
const mousePosition = computed(() => injectedMousePosition?.value ?? localMousePosition.value)

const borderColor = computed(() =>
  props.selected ? 'var(--ui-primary)' : 'var(--ui-border-default)'
)

const isNearby = computed(() => {
  if (!nodeRef.value) return false

  const rect = nodeRef.value.getBoundingClientRect()
  const mouseX = mousePosition.value.x
  const mouseY = mousePosition.value.y

  const dx = Math.max(rect.left - mouseX, 0, mouseX - rect.right)
  const dy = Math.max(rect.top - mouseY, 0, mouseY - rect.bottom)
  const distance = Math.sqrt(dx * dx + dy * dy)

  return distance <= PROXIMITY_THRESHOLD
})

const showHandles = computed(() => isHoveredLocal.value || isNearby.value)

const handleGlobalMouseMove = (e: MouseEvent) => {
  localMousePosition.value = { x: e.clientX, y: e.clientY }
}

onMounted(() => {
  if (!injectedMousePosition) {
    window.addEventListener('mousemove', handleGlobalMouseMove)
  }
})

onBeforeUnmount(() => {
  if (!injectedMousePosition) {
    window.removeEventListener('mousemove', handleGlobalMouseMove)
  }
})
</script>

<template>
  <div
    ref="nodeRef"
    class="bg-background border rounded-md px-3 py-2 relative flex"
    :style="{
      boxSizing: 'border-box',
      width: data.width ? `${data.width}px` : '120px',
      height: data.height ? `${data.height}px` : 'auto',
      minWidth: '120px',
      borderWidth: data.borderWidth ? `${data.borderWidth}px` : '2px',
      borderStyle: 'solid',
      borderColor: borderColor
    }"
    @mouseenter="isHoveredLocal = true"
    @mouseleave="isHoveredLocal = false"
    @dblclick="data.onEdit?.()"
  >
    <!-- Connection handles -->
    <Handle
      v-for="handle in FLOW_HANDLES"
      :id="`${handle.id}`"
      :key="`${handle.id}`"
      type="source"
      :position="handle.position"
      :style="{
        left: handle.offsetPercent?.x !== undefined ? `${handle.offsetPercent.x}%` : undefined,
        top: handle.offsetPercent?.y !== undefined ? `${handle.offsetPercent.y}%` : undefined,
        pointerEvents: 'all',
        opacity: showHandles ? 1 : 0,
        transition: 'opacity 0.2s',
        width: '6px',
        height: '6px'
      }"
      @mousedown.stop
    />

    <div class="flex items-center justify-center gap-2 w-full">
      <span class="text-sm font-medium">{{ data.name }}</span>
    </div>

    <!-- Resize handles -->
    <div
      class="absolute top-0 left-[8px] right-[8px] h-[8px] cursor-ns-resize nodrag"
      style="z-index: 10;"
      @mousedown.stop.prevent="data.onResizeStart?.($event, 'top')"
    />
    <div
      class="absolute bottom-0 left-[8px] right-[8px] h-[8px] cursor-ns-resize nodrag"
      style="z-index: 10;"
      @mousedown.stop.prevent="data.onResizeStart?.($event, 'bottom')"
    />
    <div
      class="absolute left-0 top-[8px] bottom-[8px] w-[8px] cursor-ew-resize nodrag"
      style="z-index: 10;"
      @mousedown.stop.prevent="data.onResizeStart?.($event, 'left')"
    />
    <div
      class="absolute right-0 top-[8px] bottom-[8px] w-[8px] cursor-ew-resize nodrag"
      style="z-index: 10;"
      @mousedown.stop.prevent="data.onResizeStart?.($event, 'right')"
    />
    <div
      class="absolute top-0 left-0 w-[8px] h-[8px] cursor-nwse-resize nodrag"
      style="z-index: 11;"
      @mousedown.stop.prevent="data.onResizeStart?.($event, 'top-left')"
    />
    <div
      class="absolute top-0 right-0 w-[8px] h-[8px] cursor-nesw-resize nodrag"
      style="z-index: 11;"
      @mousedown.stop.prevent="data.onResizeStart?.($event, 'top-right')"
    />
    <div
      class="absolute bottom-0 left-0 w-[8px] h-[8px] cursor-nesw-resize nodrag"
      style="z-index: 11;"
      @mousedown.stop.prevent="data.onResizeStart?.($event, 'bottom-left')"
    />
    <div
      class="absolute bottom-0 right-0 w-[8px] h-[8px] cursor-nwse-resize nodrag"
      style="z-index: 11;"
      @mousedown.stop.prevent="data.onResizeStart?.($event, 'bottom-right')"
    />
  </div>
</template>
