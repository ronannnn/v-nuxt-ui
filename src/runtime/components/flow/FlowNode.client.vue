<script setup lang="ts">
import { ref, computed, inject, onMounted, onBeforeUnmount } from 'vue'
import { Handle } from '@vue-flow/core'
import { FLOW_HANDLES, FLOW_MOUSE_POSITION_KEY } from '#v/constants'

const props = defineProps<{
  data: any
  hoveredNodeId: string | null
  selected?: boolean
}>()

const nodeRef = ref<HTMLElement | null>(null)
const PROXIMITY_THRESHOLD = 50 // 鼠标距离节点的阈值（像素）

// 优先使用父组件注入的鼠标位置（避免每个节点都添加独立的 mousemove 监听）
const injectedMousePosition = inject(FLOW_MOUSE_POSITION_KEY, null)
const localMousePosition = ref({ x: 0, y: 0 })
const mousePosition = computed(() => injectedMousePosition?.value ?? localMousePosition.value)

// 根据选中状态设置边框颜色
const borderColor = computed(() =>
  props.selected ? 'var(--ui-primary)' : 'var(--ui-border-default)'
)

// 计算鼠标是否靠近节点
const isNearby = computed(() => {
  if (!nodeRef.value) return false

  const rect = nodeRef.value.getBoundingClientRect()
  const mouseX = mousePosition.value.x
  const mouseY = mousePosition.value.y

  // 计算鼠标到矩形边界的最短距离
  const dx = Math.max(rect.left - mouseX, 0, mouseX - rect.right)
  const dy = Math.max(rect.top - mouseY, 0, mouseY - rect.bottom)
  const distance = Math.sqrt(dx * dx + dy * dy)

  return distance <= PROXIMITY_THRESHOLD
})

const isHovered = computed(() => props.hoveredNodeId === String(props.data.id))

// 显示 handle：hover 或靠近
const showHandles = computed(() => isHovered.value || isNearby.value)

// 仅在没有注入鼠标位置时，使用本地监听作为降级方案
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
    @mouseenter="data.onMouseEnter?.()"
    @mouseleave="data.onMouseLeave?.()"
    @mousemove="(e) => data.onMouseMove?.(e, e.currentTarget)"
    @dblclick="data.onEdit?.()"
  >
    <!-- 连接点 - 可以作为 source 或 target -->
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
  </div>
</template>
