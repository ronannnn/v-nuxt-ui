<script setup lang="ts">
import { ref, computed, inject, onMounted, onBeforeUnmount } from 'vue'
import { Handle } from '@vue-flow/core'
import { FLOW_HANDLES, FLOW_HANDLES_SMALL, FLOW_HANDLES_MEDIUM, FLOW_HANDLE_TIER_THRESHOLDS, FLOW_MOUSE_POSITION_KEY } from '#v/constants'

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

// 根据节点尺寸动态选择 handle 层级
const activeHandles = computed(() => {
  const w = props.data.width ?? 120
  const h = props.data.height ?? 40
  const t = FLOW_HANDLE_TIER_THRESHOLDS
  if (w < t.small.maxWidth || h < t.small.maxHeight) return FLOW_HANDLES_SMALL
  if (w < t.medium.maxWidth || h < t.medium.maxHeight) return FLOW_HANDLES_MEDIUM
  return FLOW_HANDLES
})

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
    class="bg-background border px-3 py-2 relative flex"
    :style="{
      boxSizing: 'border-box',
      width: data.width ? `${data.width}px` : '120px',
      height: data.height ? `${data.height}px` : 'auto',
      minWidth: '120px',
      borderWidth: data.borderWidth ? `${data.borderWidth}px` : '2px',
      borderStyle: 'solid',
      borderColor: borderColor,
      borderRadius: data.borderRadius !== undefined ? `${data.borderRadius}px` : '6px',
      ...(data.bgColor ? { backgroundColor: data.bgColor } : {}),
      fontSize: data.fontSize ? `${data.fontSize}px` : '14px'
    }"
    @mouseenter="isHoveredLocal = true"
    @mouseleave="isHoveredLocal = false"
    @dblclick="data.onEdit?.()"
  >
    <!-- Connection handles -->
    <Handle
      v-for="handle in activeHandles"
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
      <span class="font-medium">{{ data.name }}</span>
    </div>

    <!-- Resize handles (12px hit area for better sensitivity) -->
    <div
      class="absolute top-[-4px] left-[12px] right-[12px] h-[12px] cursor-ns-resize nodrag"
      style="z-index: 10;"
      @mousedown.stop.prevent="data.onResizeStart?.($event, 'top')"
    />
    <div
      class="absolute bottom-[-4px] left-[12px] right-[12px] h-[12px] cursor-ns-resize nodrag"
      style="z-index: 10;"
      @mousedown.stop.prevent="data.onResizeStart?.($event, 'bottom')"
    />
    <div
      class="absolute left-[-4px] top-[12px] bottom-[12px] w-[12px] cursor-ew-resize nodrag"
      style="z-index: 10;"
      @mousedown.stop.prevent="data.onResizeStart?.($event, 'left')"
    />
    <div
      class="absolute right-[-4px] top-[12px] bottom-[12px] w-[12px] cursor-ew-resize nodrag"
      style="z-index: 10;"
      @mousedown.stop.prevent="data.onResizeStart?.($event, 'right')"
    />
    <div
      class="absolute top-[-4px] left-[-4px] w-[12px] h-[12px] cursor-nwse-resize nodrag"
      style="z-index: 11;"
      @mousedown.stop.prevent="data.onResizeStart?.($event, 'top-left')"
    />
    <div
      class="absolute top-[-4px] right-[-4px] w-[12px] h-[12px] cursor-nesw-resize nodrag"
      style="z-index: 11;"
      @mousedown.stop.prevent="data.onResizeStart?.($event, 'top-right')"
    />
    <div
      class="absolute bottom-[-4px] left-[-4px] w-[12px] h-[12px] cursor-nesw-resize nodrag"
      style="z-index: 11;"
      @mousedown.stop.prevent="data.onResizeStart?.($event, 'bottom-left')"
    />
    <div
      class="absolute bottom-[-4px] right-[-4px] w-[12px] h-[12px] cursor-nwse-resize nodrag"
      style="z-index: 11;"
      @mousedown.stop.prevent="data.onResizeStart?.($event, 'bottom-right')"
    />
  </div>
</template>
