<script setup lang="ts">
import { ref, computed, provide, watchEffect, watch, nextTick, onMounted, onBeforeUnmount, toRef } from 'vue'
import { VueFlow, useVueFlow, Panel } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import type { Flow, FlowNode as FlowNodeType, FlowMousePosition, FlowApi, UseFlowResizeDimensions } from '#v/types'
import { FLOW_MOUSE_POSITION_KEY, FLOW_EDITABLE_KEY, FLOW_EDGE_STROKE_TYPES } from '#v/constants'
import type { ResizeEdge } from '#v/constants'
import FlowNode from './FlowNode.client.vue'
import FlowEdge from './FlowEdge.client.vue'
import FlowToolbar from './FlowToolbar.vue'
import FlowStats from './FlowStats.vue'
import { useFlow, useFlowResize, useFlowStyles } from '#v/composables'

const props = withDefaults(defineProps<{
  /** Flow 数据模型 (v-model) */
  modelValue?: Flow
  /** CRUD API 回调，节点/边增删改时调用 */
  api?: FlowApi
  /** 是否显示背景网格 */
  showBackground?: boolean
  /** 是否显示工具栏 */
  showToolbar?: boolean
  /** 是否显示统计面板 */
  showStats?: boolean
  /** 最小缩放 */
  minZoom?: number
  /** 最大缩放 */
  maxZoom?: number
  /** 默认缩放 */
  defaultZoom?: number
  /** 是否允许鼠标滚轮缩放 */
  zoomable?: boolean
  /** 是否允许拖拽画布（平移） */
  draggable?: boolean
  /** 是否可编辑（false 时：工具栏新增按钮禁用、edge 不能增删改、node handles 不显示） */
  editable?: boolean
  /** 是否自动适配填满容器并居中 */
  fitView?: boolean
  fitViewPadding?: number
  noFlowNodeBorder?: boolean
}>(), {
  modelValue: () => ({ id: 0, nodes: [], edges: [] }),
  api: undefined,
  showBackground: true,
  showToolbar: true,
  showStats: true,
  minZoom: 0.2,
  maxZoom: 4,
  defaultZoom: 1,
  zoomable: true,
  draggable: true,
  editable: true,
  fitView: false,
  fitViewPadding: 0.01
})

const emit = defineEmits<{
  /** 数据模型更新 */
  'update:modelValue': [value: Flow]
  /** 双击节点时触发，由使用者自行处理编辑逻辑 */
  'edit-node': [node: FlowNodeType]
}>()

// 使用业务逻辑 composable
const handleUpdateModel = (model: Flow) => {
  emit('update:modelValue', model)
}

const flowLogic = useFlow({
  flow: computed(() => props.modelValue),
  onUpdateModel: computed(() => handleUpdateModel),
  api: computed(() => props.api)
})

const {
  nodes,
  edges,
  GRID_SIZE,
  loading,
  deleteNode,
  deleteEdge,
  createEdge,
  reconnectEdge,
  updateNodePosition,
  updateNodeDimensions,
  createNode,
  updateEdgeLabel
} = flowLogic

// 样式设置
const {
  edgeStrokeWidth,
  edgeMarkerStart,
  edgeMarkerEnd,
  edgeAnimated,
  edgeStrokeType,
  edgePathType,
  edgeColor,
  edgeColorOpacity,
  edgeLabelColor,
  nodeShowBorder,
  nodeBorderWidth,
  nodeBorderRadius,
  nodeBorderColor,
  nodeBgColor,
  nodeFontColor,
  nodeFontSize,
  nodeHandleSize,
  nodeHandleColor,
  colorMode,
  unifiedColor,
  isUnifiedMode,
  effectiveNodeBorderColor,
  effectiveNodeBgColor,
  effectiveNodeFontColor,
  effectiveNodeHandleColor,
  effectiveEdgeColor
} = useFlowStyles()

// VueFlow 实例
const { onConnect, onNodeDragStop, onEdgeUpdate, getSelectedNodes, getSelectedEdges, getViewport, fitView: vueFlowFitView } = useVueFlow()

// Resize 功能
const handleResizeEnd = async (nodeId: string, dimensions: UseFlowResizeDimensions) => {
  await updateNodeDimensions(nodeId, dimensions)
}

const resizeLogic = useFlowResize({
  gridSize: GRID_SIZE,
  nodes,
  getViewport,
  onResizeEnd: handleResizeEnd
})

const {
  startResize,
  handleMouseMove,
  handleMouseUp
} = resizeLogic

// 共享鼠标位置（通过 provide/inject 传递给子组件，避免每个 FlowNode 都添加独立的 mousemove 监听）
const mousePosition = ref<FlowMousePosition>({ x: 0, y: 0 })
provide(FLOW_MOUSE_POSITION_KEY, mousePosition)

// 共享可编辑状态
provide(FLOW_EDITABLE_KEY, toRef(props, 'editable'))

// 处理节点编辑（双击）
const handleEditNode = (nodeId: string) => {
  const flowNode = props.modelValue?.nodes?.find(n => String(n.id) === nodeId)
  if (flowNode) {
    emit('edit-node', flowNode)
  }
}

// 同步节点数据，添加事件处理器和样式
watchEffect(() => {
  flowLogic.syncNodes(nodeId => ({
    onEdit: () => handleEditNode(nodeId),
    onDelete: () => deleteNode(nodeId),
    showBorder: nodeShowBorder.value && !props.noFlowNodeBorder,
    borderWidth: nodeBorderWidth.value,
    borderRadius: nodeBorderRadius.value,
    borderColor: effectiveNodeBorderColor.value,
    bgColor: effectiveNodeBgColor.value,
    fontColor: effectiveNodeFontColor.value,
    fontSize: nodeFontSize.value,
    handleSize: nodeHandleSize.value,
    handleColor: effectiveNodeHandleColor.value,
    onResizeStart: (event: MouseEvent, edge: ResizeEdge) => {
      if (!props.editable) return
      const node = props.modelValue?.nodes?.find(n => String(n.id) === nodeId)
      if (node) {
        startResize(event, nodeId, node, edge)
      }
    }
  }))
})

// 同步边的样式（在初始化和样式变化时）
watchEffect(() => {
  const dasharray = FLOW_EDGE_STROKE_TYPES.find(t => t.type === edgeStrokeType.value)?.dasharray || ''
  edges.value.forEach((edge) => {
    edge.style = {
      strokeWidth: edgeStrokeWidth.value,
      ...(dasharray ? { strokeDasharray: dasharray } : {}),
      ...(effectiveEdgeColor.value ? { stroke: effectiveEdgeColor.value } : {}),
      opacity: edgeColorOpacity.value / 100
    }
    // Markers are handled by FlowEdge custom SVG markers
    edge.markerStart = undefined
    edge.markerEnd = undefined
    edge.animated = false
  })
})

// 同步边的事件处理器
watchEffect(() => {
  flowLogic.syncEdges(edgeId => ({
    onUpdateLabel: (newLabel: string) => updateEdgeLabel(edgeId, newLabel)
  }))
})

// 检查是否为删除键
const isDeleteKey = (event: KeyboardEvent) => {
  return event.key === 'Delete' || event.key === 'Backspace' || event.code === 'Backspace'
}

const isEditableTarget = (target: EventTarget | null) => {
  const element = target instanceof HTMLElement ? target : null
  if (!element) return false

  const tagName = element.tagName
  return element.isContentEditable || tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT'
}

// 键盘事件处理
const handleKeyDown = async (event: KeyboardEvent) => {
  if (!props.editable) return
  if (!isDeleteKey(event)) return
  if (isEditableTarget(event.target)) return

  event.preventDefault()
  event.stopPropagation()
  event.stopImmediatePropagation()

  const selectedNodes = getSelectedNodes.value
  const selectedEdges = getSelectedEdges.value

  if (selectedNodes.length === 0 && selectedEdges.length === 0) return

  await Promise.all([
    ...selectedNodes.map(node => deleteNode(node.id)),
    ...selectedEdges.map(edge => deleteEdge(edge.id))
  ])
}

// 生命周期钩子
onMounted(() => {
  // 合并鼠标移动处理：更新共享位置 + 处理 resize 逻辑
  const handleGlobalMouseMove = (event: MouseEvent) => {
    mousePosition.value = { x: event.clientX, y: event.clientY }
    handleMouseMove(event)
  }

  document.addEventListener('keydown', handleKeyDown, true)
  window.addEventListener('mousemove', handleGlobalMouseMove)
  window.addEventListener('mouseup', handleMouseUp)

  // fitView 模式：延迟执行确保 VueFlow 已完成内部布局
  if (props.fitView) {
    setTimeout(() => vueFlowFitView({ padding: props.fitViewPadding }), 100)
  }

  onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleKeyDown, true)
    window.removeEventListener('mousemove', handleGlobalMouseMove)
    window.removeEventListener('mouseup', handleMouseUp)
  })
})

// 节点拖动结束
onNodeDragStop(async (event) => {
  const { node } = event
  await updateNodePosition(node.id, node.position.x, node.position.y)
})

// 连接节点
onConnect(async (params) => {
  if (!props.editable) return
  await createEdge(params)
})

// Edge reconnect：拖拽边端点到新 handle 时触发（onEdgeUpdate 提供 connection）
onEdgeUpdate(({ edge, connection }) => {
  if (!props.editable) return
  if (connection.source && connection.target) {
    reconnectEdge(edge.id, connection)
  }
})

// fitView 模式：当节点数据变化或 fitView 开启时自动适配
watch(
  [
    () => props.fitView,
    () => nodes.value.map(n => `${n.id}:${n.position?.x}:${n.position?.y}:${n.data?.width}:${n.data?.height}`).join(',')
  ],
  () => {
    if (props.fitView) nextTick(() => vueFlowFitView({ padding: props.fitViewPadding }))
  },
  { flush: 'post' }
)

// 边的默认样式配置
const defaultEdgeOptions = computed(() => {
  const dasharray = FLOW_EDGE_STROKE_TYPES.find(t => t.type === edgeStrokeType.value)?.dasharray || ''
  return {
    style: {
      strokeWidth: edgeStrokeWidth.value,
      ...(dasharray ? { strokeDasharray: dasharray } : {}),
      ...(effectiveEdgeColor.value ? { stroke: effectiveEdgeColor.value } : {}),
      opacity: edgeColorOpacity.value / 100
    },
    // Markers are handled by FlowEdge custom SVG markers
    markerStart: undefined,
    markerEnd: undefined,
    animated: false
  }
})

// 监听容器宽度变化，自动 fitView 居中
const flowContainer = ref<HTMLElement | null>(null)
let resizeObserver: ResizeObserver | null = null
let prevWidth = 0

onMounted(() => {
  const el = flowContainer.value?.$el ?? flowContainer.value
  if (!el) return
  prevWidth = el.clientWidth
  resizeObserver = new ResizeObserver((entries) => {
    const entry = entries[0]
    if (!entry) return
    const newWidth = entry.contentRect.width
    if (newWidth !== prevWidth) {
      prevWidth = newWidth
      nextTick(() => vueFlowFitView({ padding: props.fitViewPadding }))
    }
  })
  resizeObserver.observe(el)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
})

// 允许任意连接
const isValidConnection = () => true
</script>

<template>
  <VueFlow
    ref="flowContainer"
    v-model:nodes="nodes"
    v-model:edges="edges"
    :default-zoom="defaultZoom"
    :min-zoom="minZoom"
    :max-zoom="maxZoom"
    :snap-to-grid="true"
    :snap-grid="[GRID_SIZE, GRID_SIZE]"
    :default-edge-options="defaultEdgeOptions"
    :is-valid-connection="isValidConnection"
    :edges-updatable="editable"
    :zoom-on-scroll="zoomable"
    :zoom-on-pinch="zoomable"
    :zoom-on-double-click="zoomable"
    :pan-on-drag="draggable"
    :pan-on-scroll="false"
    :nodes-draggable="draggable"
    :nodes-connectable="editable"
    :elements-selectable="editable"
    :class="{ 'flow-fit-view': fitView }"
  >
    <Background
      v-if="showBackground"
      pattern-color="var(--ui-bg-elevated)"
      :gap="GRID_SIZE"
      variant="lines"
    />

    <template #node-custom="nodeProps">
      <FlowNode v-bind="nodeProps">
        <template v-if="$slots.node" #default="{ data }">
          <slot name="node" :data="data" />
        </template>
      </FlowNode>
    </template>

    <template #edge-custom="edgeProps">
      <FlowEdge v-bind="edgeProps" />
    </template>

    <Panel v-if="showToolbar" position="bottom-center">
      <FlowToolbar
        :on-add-node="createNode"
        :loading="loading"
        :editable="editable"
        :edge-stroke-width="edgeStrokeWidth"
        :edge-stroke-type="edgeStrokeType"
        :edge-path-type="edgePathType"
        :edge-marker-start="edgeMarkerStart"
        :edge-marker-end="edgeMarkerEnd"
        :edge-animated="edgeAnimated"
        :edge-color="edgeColor"
        :edge-color-opacity="edgeColorOpacity"
        :edge-label-color="edgeLabelColor"
        :node-show-border="nodeShowBorder"
        :node-border-width="nodeBorderWidth"
        :node-border-radius="nodeBorderRadius"
        :node-border-color="nodeBorderColor"
        :node-bg-color="nodeBgColor"
        :node-font-color="nodeFontColor"
        :node-font-size="nodeFontSize"
        :node-handle-size="nodeHandleSize"
        :node-handle-color="nodeHandleColor"
        :on-edge-stroke-width-change="(v) => edgeStrokeWidth = v"
        :on-edge-stroke-type-change="(v) => edgeStrokeType = v"
        :on-edge-path-type-change="(v) => edgePathType = v"
        :on-edge-marker-start-change="(v) => edgeMarkerStart = v"
        :on-edge-marker-end-change="(v) => edgeMarkerEnd = v"
        :on-toggle-edge-animated="() => edgeAnimated = !edgeAnimated"
        :on-edge-color-change="(v) => edgeColor = v"
        :on-edge-color-opacity-change="(v) => edgeColorOpacity = v"
        :on-edge-label-color-change="(v) => edgeLabelColor = v"
        :on-toggle-node-show-border="() => nodeShowBorder = !nodeShowBorder"
        :on-node-border-width-change="(v) => nodeBorderWidth = v"
        :on-node-border-radius-change="(v) => nodeBorderRadius = v"
        :on-node-border-color-change="(v) => nodeBorderColor = v"
        :on-node-bg-color-change="(v) => nodeBgColor = v"
        :on-node-font-color-change="(v) => nodeFontColor = v"
        :on-node-font-size-change="(v) => nodeFontSize = v"
        :on-node-handle-size-change="(v) => nodeHandleSize = v"
        :on-node-handle-color-change="(v) => nodeHandleColor = v"
        :color-mode="colorMode"
        :unified-color="unifiedColor"
        :is-unified-mode="isUnifiedMode"
        :on-color-mode-change="(v) => colorMode = v"
        :on-unified-color-change="(v) => unifiedColor = v"
      />
    </Panel>

    <Panel v-if="showStats" position="top-right">
      <div class="flex items-center gap-2">
        <Transition name="fade">
          <UIcon
            v-if="loading"
            name="i-lucide-loader-2"
            class="text-primary animate-spin"
            size="18"
          />
        </Transition>
        <FlowStats :node-count="nodes.length" :edge-count="edges.length" />
      </div>
    </Panel>

    <!-- 透传额外的 Panel 插槽 -->
    <slot />
  </VueFlow>
</template>

<style>
/* Vue Flow 基础样式 */
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* fitView 模式：占满容器 */
.flow-fit-view {
  width: 100% !important;
  height: 100% !important;
}
</style>
