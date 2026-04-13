<script setup lang="ts">
import { computed } from 'vue'
import { Handle } from '@vue-flow/core'
import { FLOW_RESIZE_HANDLES, GRID_SIZE } from '#v/constants'
import { useFlowNode } from '#v/composables'

const props = defineProps<{
  data: any
  selected?: boolean
}>()

const {
  isHoveredLocal,
  borderColor,
  activeHandles,
  handleStyle
} = useFlowNode({
  data: computed(() => props.data),
  selected: computed(() => props.selected ?? false)
})
</script>

<template>
  <div
    ref="nodeRef"
    class="bg-background border px-3 py-2 relative flex"
    :style="{
      boxSizing: 'border-box',
      width: data.width ? `${data.width}px` : GRID_SIZE * 6 + 'px',
      height: data.height ? `${data.height}px` : 'auto',
      minWidth: GRID_SIZE * 2 + 'px',
      minHeight: GRID_SIZE * 2 + 'px',
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
    <!-- Connection handles (z-index 高于 resize handles，优先响应连线拖拽) -->
    <Handle
      v-for="handle in activeHandles"
      :id="`${handle.id}`"
      :key="`${handle.id}`"
      type="source"
      :position="handle.position"
      :style="handleStyle(handle)"
      @mousedown.stop
    />

    <!-- content -->
    <div class="flex items-center justify-center gap-2 w-full">
      <slot :data="data">
        <span class="font-medium">{{ data.name }}</span>
      </slot>
    </div>

    <!-- Resize handles (z-index 低于 connection handles，连线优先) -->
    <div
      v-for="rh in FLOW_RESIZE_HANDLES"
      :key="rh.edge"
      class="absolute nodrag"
      :class="rh.class"
      :style="{ zIndex: rh.zIndex, cursor: rh.cursor }"
      @mousedown.stop.prevent="data.onResizeStart?.($event, rh.edge)"
    />
  </div>
</template>
