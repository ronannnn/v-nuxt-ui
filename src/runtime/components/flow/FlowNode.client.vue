<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import { Handle } from '@vue-flow/core'
import { FLOW_RESIZE_HANDLES, FLOW_EDITABLE_KEY, GRID_SIZE } from '#v/constants'
import { useFlowNode } from '#v/composables'

const props = defineProps<{
  data: any
  selected?: boolean
}>()

const editable = inject(FLOW_EDITABLE_KEY, ref(true))

const {
  nodeRef,
  isHoveredLocal,
  borderColor,
  activeHandles,
  handleStyle
} = useFlowNode({
  data: computed(() => props.data),
  selected: computed(() => props.selected ?? false)
})

const setNodeRef = (el: Element | ComponentPublicInstance | null) => {
  nodeRef.value = el instanceof HTMLElement ? el : null
}

/** 节点是否显示边框（优先使用 data.showBorder，默认 true） */
const showBorder = computed(() => props.data.showBorder !== false)
</script>

<template>
  <div
    :ref="setNodeRef"
    class="bg-background relative flex"
    :class="{ border: showBorder }"
    :style="{
      boxSizing: 'border-box',
      width: data.width ? `${data.width}px` : GRID_SIZE * 6 + 'px',
      height: data.height ? `${data.height}px` : 'auto',
      minWidth: GRID_SIZE * 2 + 'px',
      minHeight: GRID_SIZE * 2 + 'px',
      borderWidth: showBorder ? (data.borderWidth ? `${data.borderWidth}px` : '2px') : '0px',
      borderStyle: showBorder ? 'solid' : 'none',
      borderColor: showBorder ? borderColor : 'transparent',
      borderRadius: data.borderRadius !== undefined ? `${data.borderRadius}px` : '6px',
      ...(data.bgColor ? { backgroundColor: data.bgColor } : {}),
      ...(data.fontColor ? { color: data.fontColor } : {}),
      fontSize: data.fontSize ? `${data.fontSize}px` : '14px'
    }"
    @mouseenter="isHoveredLocal = true"
    @mouseleave="isHoveredLocal = false"
    @dblclick="data.onEdit?.()"
  >
    <!-- Connection handles：仅在可编辑模式下渲染 -->
    <template v-if="editable">
      <Handle
        v-for="handle in activeHandles"
        :id="`${handle.id}`"
        :key="`${handle.id}`"
        type="source"
        :position="handle.position"
        :style="handleStyle(handle)"
        @mousedown.stop
      />
    </template>

    <!-- content -->
    <div class="flex items-center justify-center gap-2 w-full">
      <slot :data="data">
        <span class="font-medium">{{ data.name }}</span>
      </slot>
    </div>

    <!-- Resize handles：仅在可编辑模式下渲染 -->
    <template v-if="editable">
      <div
        v-for="rh in FLOW_RESIZE_HANDLES"
        :key="rh.edge"
        class="absolute nodrag"
        :class="rh.class"
        :style="{ zIndex: rh.zIndex, cursor: rh.cursor }"
        @mousedown.stop.prevent="data.onResizeStart?.($event, rh.edge)"
      />
    </template>
  </div>
</template>
