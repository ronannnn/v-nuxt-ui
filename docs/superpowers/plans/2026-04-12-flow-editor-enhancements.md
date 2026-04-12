# FlowEditor 6 Issue Enhancement Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 6 issues in FlowEditor: grid alignment, resize, edge label editing, edge reconnect, dynamic handles, flow API composable.

**Architecture:** Each issue is an independent task touching specific files. Tasks are ordered by dependency: grid alignment first (changes default sizes), then resize (depends on new sizes), then independent features (label editing, reconnect, dynamic handles, API).

**Tech Stack:** Vue 3, @vue-flow/core, @vue-flow/background, TypeScript, Nuxt Module

**Spec:** `docs/superpowers/specs/2026-04-12-flow-editor-enhancements-design.md`

---

### Task 1: Grid Alignment — box-sizing + default width 120px

**Files:**
- Modify: `src/runtime/components/flow/FlowNode.client.vue`
- Modify: `src/runtime/composables/flow/useFlow.ts`
- Modify: `src/runtime/composables/flow/useFlowResize.ts`

**Context:** Nodes use CSS content-box by default. A `width: 128px` + `border: 2px` node occupies 132px, not aligned to GRID_SIZE=20px. Also 128 is not a multiple of 20. Fix: `box-sizing: border-box` + default width 120px (20×6).

- [ ] **Step 1: Add `box-sizing: border-box` to FlowNode**

In `src/runtime/components/flow/FlowNode.client.vue`, add `boxSizing: 'border-box'` to the `:style` binding on the root div (line 68-75):

```vue
:style="{
  boxSizing: 'border-box',
  width: data.width ? `${data.width}px` : '120px',
  height: data.height ? `${data.height}px` : 'auto',
  minWidth: '120px',
  borderWidth: data.borderWidth ? `${data.borderWidth}px` : '2px',
  borderStyle: 'solid',
  borderColor: borderColor
}"
```

Changes: added `boxSizing: 'border-box'`, changed default width `128px` → `120px`, changed minWidth `128px` → `120px`.

- [ ] **Step 2: Update default width in useFlow.ts createNode()**

In `src/runtime/composables/flow/useFlow.ts`, in the `createNode()` function (around line 175-180), change:

```ts
data: {
  id,
  name: `节点 ${nodes.value.length + 1}`,
  width: 120,
  height: 40
}
```

Change `width: 128` → `width: 120`.

- [ ] **Step 3: Update fallback width in useFlowResize.ts**

In `src/runtime/composables/flow/useFlowResize.ts`, in `startResize()` (line 98) and `handleMouseUp()` (line 163), change all `128` fallback widths to `120`:

Line 98: `resizeStartWidth.value = node.width ?? 120`
Line 163: `width: node.data.width ?? 120`

Also update minWidth in `handleMouseMove()` (line 128): change `Math.max(64, ...)` to `Math.max(60, ...)` and `Math.max(32, ...)` to `Math.max(40, ...)` — ensuring min dimensions are grid-aligned (60=20×3, 40=20×2).

- [ ] **Step 4: Verify build passes**

Run: `pnpm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/runtime/components/flow/FlowNode.client.vue src/runtime/composables/flow/useFlow.ts src/runtime/composables/flow/useFlowResize.ts
git commit -m "fix(flow): align node borders to grid with box-sizing border-box and 120px default width"
```

---

### Task 2: Fix Resize — Overlay Handle Divs

**Files:**
- Modify: `src/runtime/components/flow/FlowNode.client.vue`
- Modify: `src/runtime/composables/flow/useFlowResize.ts`
- Modify: `src/runtime/components/flow/FlowEditor.client.vue`

**Context:** Resize doesn't work because VueFlow's internal drag system intercepts mousedown before our resize logic. Fix: add 8 invisible overlay divs as resize handles with `@mousedown.stop.prevent`. Simplify `useFlowResize` by removing `detectEdge`, `getCursorForEdge`, `createNodeHandlers`. The `hoveredNodeId` prop is removed from FlowNode — it already has its own `isHovered`/`isNearby` computed.

**Important:** The FlowNode currently receives `hoveredNodeId` as a prop from FlowEditor. After this task, that prop is removed. The `showHandles` computed in FlowNode already uses `isHovered` (from `data.onMouseEnter/Leave`) and `isNearby` (from mouse position inject). Keep those working.

- [ ] **Step 1: Simplify useFlowResize.ts**

Rewrite `src/runtime/composables/flow/useFlowResize.ts` to remove edge detection and cursor management. Keep only resize state machine (start/move/end):

```ts
import { ref } from 'vue'
import type { ShallowRef } from 'vue'
import type { Node } from '@vue-flow/core'
import type { FlowNode, UseFlowResizeDimensions } from '#v/types'

export type ResizeEdge = 'top' | 'right' | 'bottom' | 'left' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

interface UseFlowResizeOptions {
  gridSize: number
  nodes: ShallowRef<Node[]>
  getViewport: () => { x: number, y: number, zoom: number }
  onResizeEnd: (nodeId: string, dimensions: UseFlowResizeDimensions) => void
}

export function useFlowResize(options: UseFlowResizeOptions) {
  const { gridSize, nodes, getViewport, onResizeEnd } = options

  const isResizing = ref(false)
  const resizingNodeId = ref<string | null>(null)
  const resizeEdge = ref<ResizeEdge | null>(null)
  const resizeStartX = ref(0)
  const resizeStartY = ref(0)
  const resizeStartWidth = ref(0)
  const resizeStartHeight = ref(0)
  const resizeStartNodeX = ref(0)
  const resizeStartNodeY = ref(0)

  const startResize = (
    event: MouseEvent,
    nodeId: string,
    node: FlowNode,
    edge: ResizeEdge
  ) => {
    event.preventDefault()
    event.stopPropagation()

    isResizing.value = true
    resizingNodeId.value = nodeId
    resizeEdge.value = edge
    resizeStartX.value = event.clientX
    resizeStartY.value = event.clientY
    resizeStartWidth.value = node.width ?? 120
    resizeStartHeight.value = node.height ?? 40
    resizeStartNodeX.value = node.x ?? 0
    resizeStartNodeY.value = node.y ?? 0

    document.body.style.userSelect = 'none'
  }

  const handleMouseMove = (event: MouseEvent) => {
    if (!isResizing.value || !resizingNodeId.value || !resizeEdge.value) return

    const viewport = getViewport()
    const zoom = viewport.zoom

    const dx = (event.clientX - resizeStartX.value) / zoom
    const dy = (event.clientY - resizeStartY.value) / zoom

    const node = nodes.value.find(n => n.id === resizingNodeId.value)
    if (!node) return

    let newWidth = resizeStartWidth.value
    let newHeight = resizeStartHeight.value
    let newX = resizeStartNodeX.value
    let newY = resizeStartNodeY.value

    const edge = resizeEdge.value

    if (edge.includes('right')) {
      newWidth = Math.max(60, resizeStartWidth.value + dx)
    }
    if (edge.includes('left')) {
      const deltaWidth = Math.min(dx, resizeStartWidth.value - 60)
      newWidth = resizeStartWidth.value - deltaWidth
      newX = resizeStartNodeX.value + deltaWidth
    }

    if (edge.includes('bottom')) {
      newHeight = Math.max(40, resizeStartHeight.value + dy)
    }
    if (edge === 'top' || edge === 'top-left' || edge === 'top-right') {
      const deltaHeight = Math.min(dy, resizeStartHeight.value - 40)
      newHeight = resizeStartHeight.value - deltaHeight
      newY = resizeStartNodeY.value + deltaHeight
    }

    newWidth = Math.round(newWidth / gridSize) * gridSize
    newHeight = Math.round(newHeight / gridSize) * gridSize
    newX = Math.round(newX / gridSize) * gridSize
    newY = Math.round(newY / gridSize) * gridSize

    node.data = { ...node.data, width: newWidth, height: newHeight }
    node.position = { x: newX, y: newY }
  }

  const handleMouseUp = () => {
    if (isResizing.value && resizingNodeId.value) {
      const node = nodes.value.find(n => n.id === resizingNodeId.value)
      if (node) {
        onResizeEnd(resizingNodeId.value, {
          width: node.data.width ?? 120,
          height: node.data.height ?? 40
        })
      }
    }

    isResizing.value = false
    resizingNodeId.value = null
    resizeEdge.value = null
    document.body.style.userSelect = ''
  }

  return {
    isResizing,
    startResize,
    handleMouseMove,
    handleMouseUp
  }
}
```

Note: `Ref` import changed to `ShallowRef` to match `nodes` type. `hoveredNodeId`, `hoveredNodeEdge`, `detectEdge`, `getCursorForEdge`, `createNodeHandlers` all removed. Body cursor management removed from `startResize`/`handleMouseUp` (CSS handles cursors now).

- [ ] **Step 2: Add overlay resize handles to FlowNode.client.vue**

In `src/runtime/components/flow/FlowNode.client.vue`:

1. Remove the `hoveredNodeId` prop (no longer passed from parent).
2. Remove the `isHovered` computed that depended on `hoveredNodeId`. The `showHandles` computed should now only use `isNearby` (mouse proximity detection via inject). Or add a local `isHovered` ref toggled by `@mouseenter`/`@mouseleave` on the root div directly (not via data callbacks).
3. Add 8 resize handle divs inside the root div, after the content div.

Updated script section changes:
```ts
const props = defineProps<{
  data: any
  selected?: boolean
}>()

// Remove hoveredNodeId prop
// Replace isHovered with local hover state
const isHoveredLocal = ref(false)

const showHandles = computed(() => isHoveredLocal.value || isNearby.value)
```

Updated template — root div mouseenter/mouseleave directly set `isHoveredLocal`:
```vue
@mouseenter="isHoveredLocal = true"
@mouseleave="isHoveredLocal = false"
```

Remove `data.onMouseEnter/onMouseLeave/onMouseMove` calls from template.

Add resize handle divs inside root div, after the content div:
```vue
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
```

The `nodrag` class tells VueFlow not to initiate node dragging on these elements.

- [ ] **Step 3: Update FlowEditor.client.vue for new resize approach**

In `src/runtime/components/flow/FlowEditor.client.vue`:

1. Remove `hoveredNodeId` and `hoveredNodeEdge` from the destructured `resizeLogic` return.
2. Remove `createNodeHandlers` from destructured return.
3. Remove `hoveredNodeId` prop from `<FlowNode>` in template (line 245).
4. In `syncNodes` watchEffect, replace `...createNodeHandlers(nodeId)` with:

```ts
onResizeStart: (event: MouseEvent, edge: string) => {
  const node = props.modelValue?.nodes?.find(n => String(n.id) === nodeId)
  if (node) {
    startResize(event, nodeId, node, edge as any)
  }
},
```

5. Remove `hoveredNodeEdge` from the `handleGlobalMouseDown` logic in `onMounted` — the entire `handleGlobalMouseDown` function can be removed since resize is now initiated directly from the node's overlay handles.

- [ ] **Step 4: Verify build passes**

Run: `pnpm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/runtime/components/flow/FlowNode.client.vue src/runtime/composables/flow/useFlowResize.ts src/runtime/components/flow/FlowEditor.client.vue
git commit -m "fix(flow): implement overlay resize handles to fix resize not working"
```

---

### Task 3: Edge Label Editing

**Files:**
- Modify: `src/runtime/components/flow/FlowEdge.client.vue`
- Modify: `src/runtime/composables/flow/useFlow.ts`
- Modify: `src/runtime/components/flow/FlowEditor.client.vue`

**Context:** Edge labels are static. Need: double-click to edit in place. For edges without labels, show an invisible placeholder that can be double-clicked to create a label. Data flow: FlowEdge calls `data.onUpdateLabel(newLabel)` → FlowEditor → `useFlow.updateEdgeLabel()` → `emitUpdate()`.

- [ ] **Step 1: Add `updateEdgeLabel` and `syncEdges` to useFlow.ts**

In `src/runtime/composables/flow/useFlow.ts`:

Add `updateEdgeLabel` method after `updateNodeDimensions`:
```ts
const updateEdgeLabel = (edgeId: string, label: string) => {
  const edge = edges.value.find(e => e.id === edgeId)
  if (edge) {
    edge.label = label || undefined
    emitUpdate()
  }
}
```

Add `syncEdges` method after `syncNodes`:
```ts
const syncEdges = (createHandlers: (edgeId: string) => Record<string, any>) => {
  edges.value.forEach((edge) => {
    const handlers = createHandlers(edge.id)
    if (!edge.data) edge.data = {}
    Object.assign(edge.data, handlers)
  })
}
```

Add both to the return object and `UseFlowReturn` interface:
```ts
updateEdgeLabel: (edgeId: string, label: string) => void
syncEdges: (createHandlers: (edgeId: string) => Record<string, any>) => void
```

- [ ] **Step 2: Rewrite FlowEdge.client.vue with label editing**

Rewrite `src/runtime/components/flow/FlowEdge.client.vue`:

```vue
<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useFlowStyles } from '#v/composables/flow/useFlowStyles'
import { EdgeLabelRenderer, getSmoothStepPath, BaseEdge } from '@vue-flow/core'
import type { EdgeProps } from '@vue-flow/core'

const props = defineProps<EdgeProps>()

const path = computed(() => getSmoothStepPath(props))

const flowStyles = useFlowStyles()
const { edgeMarkerStart, edgeMarkerEnd } = flowStyles

const customMarkerEnd = computed(() => edgeMarkerEnd.value ? `url(#custom-arrow-end-${props.id})` : undefined)
const customMarkerStart = computed(() => edgeMarkerStart.value ? `url(#custom-arrow-start-${props.id})` : undefined)

const strokeColor = computed(() =>
  props.selected ? 'var(--ui-primary)' : 'var(--ui-text-dimmed)'
)

const edgeStyle = computed(() => ({
  ...props.style,
  stroke: strokeColor.value
}))

// Label editing state
const editingLabel = ref(false)
const tempLabel = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

const startEditing = () => {
  editingLabel.value = true
  tempLabel.value = typeof props.label === 'string' ? props.label : ''
  nextTick(() => {
    inputRef.value?.focus()
    inputRef.value?.select()
  })
}

const saveLabel = () => {
  if (!editingLabel.value) return
  editingLabel.value = false
  const newLabel = tempLabel.value.trim()
  // @ts-expect-error data is dynamic
  props.data?.onUpdateLabel?.(newLabel)
}

const cancelEditing = () => {
  editingLabel.value = false
}
</script>

<template>
  <svg style="position: absolute; width: 0; height: 0">
    <defs>
      <marker
        :id="`custom-arrow-end-${id}`"
        viewBox="-4 -4 14 18"
        refX="7"
        refY="5"
        markerWidth="5"
        markerHeight="5"
        orient="auto-start-reverse"
      >
        <path
          d="M -4 -4 L 10 5 L -4 14 z"
          :fill="strokeColor"
        />
      </marker>
      <marker
        :id="`custom-arrow-start-${id}`"
        viewBox="0 -4 14 18"
        refX="3"
        refY="5"
        markerWidth="5"
        markerHeight="5"
        orient="auto"
      >
        <path
          d="M 14 -4 L 0 5 L 14 14 z"
          :fill="strokeColor"
        />
      </marker>
    </defs>
  </svg>

  <BaseEdge
    :id="id"
    :style="edgeStyle"
    :path="path[0]"
    :marker-end="customMarkerEnd"
    :marker-start="customMarkerStart"
  />

  <EdgeLabelRenderer>
    <div
      :style="{
        position: 'absolute',
        transform: `translate(-50%, -50%) translate(${path[1]}px,${path[2]}px)`,
        pointerEvents: 'all'
      }"
      class="nodrag nopan"
      @dblclick.stop="startEditing"
    >
      <!-- Editing mode -->
      <input
        v-if="editingLabel"
        ref="inputRef"
        v-model="tempLabel"
        class="bg-background border border-default rounded px-2 py-1 text-xs outline-none"
        style="min-width: 40px; width: auto;"
        @keydown.enter="saveLabel"
        @keydown.escape="cancelEditing"
        @blur="saveLabel"
      />
      <!-- Display mode: show label or invisible placeholder for no-label edges -->
      <div
        v-else-if="label"
        class="bg-background border border-default rounded px-2 py-1 text-xs shadow-sm"
      >
        {{ label }}
      </div>
      <!-- Invisible placeholder for edges without label -->
      <div
        v-else
        class="w-6 h-4 opacity-0 hover:opacity-30 hover:bg-muted rounded transition-opacity"
      />
    </div>
  </EdgeLabelRenderer>
</template>
```

Key changes:
- Always render the `EdgeLabelRenderer` div (not only when `label` exists)
- `@dblclick.stop="startEditing"` on the wrapper
- Invisible placeholder div for no-label edges (shows subtle hint on hover)
- Input with Enter/blur → save, Escape → cancel

- [ ] **Step 3: Wire edge label editing in FlowEditor.client.vue**

In `src/runtime/components/flow/FlowEditor.client.vue`:

1. Destructure `updateEdgeLabel` and `syncEdges` from `flowLogic`.
2. Add a new `watchEffect` for syncing edge data (after the existing `syncNodes` watchEffect):

```ts
watchEffect(() => {
  flowLogic.syncEdges(edgeId => ({
    onUpdateLabel: (newLabel: string) => updateEdgeLabel(edgeId, newLabel)
  }))
})
```

- [ ] **Step 4: Verify build passes**

Run: `pnpm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/runtime/components/flow/FlowEdge.client.vue src/runtime/composables/flow/useFlow.ts src/runtime/components/flow/FlowEditor.client.vue
git commit -m "feat(flow): add edge label editing with double-click"
```

---

### Task 4: Edge Reconnect

**Files:**
- Modify: `src/runtime/components/flow/FlowEditor.client.vue`

**Context:** Use VueFlow's built-in `edgesUpdatable` feature. When user drags an edge endpoint to a new handle, delete old edge and create new one. Dropping in empty space auto-reverts (VueFlow default behavior).

- [ ] **Step 1: Add edgesUpdatable and onEdgeUpdateEnd to FlowEditor**

In `src/runtime/components/flow/FlowEditor.client.vue`:

1. Add `onEdgeUpdateEnd` to the useVueFlow destructure:
```ts
const { onConnect, onNodeDragStop, onEdgeUpdateEnd, getSelectedNodes, getSelectedEdges, getViewport } = useVueFlow()
```

2. Add handler after the `onConnect` handler:
```ts
onEdgeUpdateEnd(({ edge, connection }) => {
  deleteEdge(edge.id)
  if (connection.source && connection.target) {
    createEdge(connection)
  }
})
```

3. Add `:edges-updatable="true"` prop to `<VueFlow>` in template:
```vue
<VueFlow
  v-model:nodes="nodes"
  v-model:edges="edges"
  :default-zoom="defaultZoom"
  :min-zoom="minZoom"
  :max-zoom="maxZoom"
  :snap-to-grid="true"
  :snap-grid="[GRID_SIZE, GRID_SIZE]"
  :default-edge-options="defaultEdgeOptions"
  :is-valid-connection="isValidConnection"
  :edges-updatable="true"
>
```

- [ ] **Step 2: Verify build passes**

Run: `pnpm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/runtime/components/flow/FlowEditor.client.vue
git commit -m "feat(flow): add edge reconnect via edgesUpdatable"
```

---

### Task 5: Dynamic Handle Count

**Files:**
- Modify: `src/runtime/constants/flow.ts`
- Modify: `src/runtime/components/flow/FlowNode.client.vue`

**Context:** Currently all 16 handles show regardless of node size. Add 3-tier strategy: Small (<80w or <40h) = 4 center handles, Medium (<160w or <80h) = 8 handles (centers + corners), Large = all 16. Thresholds as configurable constants.

Handle IDs reference: `tl, tr, bl, br` (corners), `t1, t2, t3` (top), `r1, r2, r3` (right), `b1, b2, b3` (bottom), `l1, l2, l3` (left). Centers are `t2, r2, b2, l2`.

- [ ] **Step 1: Add tier constants to constants/flow.ts**

In `src/runtime/constants/flow.ts`, add after `FLOW_HANDLES`:

```ts
/**
 * Handle 层级阈值（可配置）
 */
export const FLOW_HANDLE_TIER_THRESHOLDS = {
  small: { maxWidth: 80, maxHeight: 40 },
  medium: { maxWidth: 160, maxHeight: 80 },
} as const

/**
 * Small 层级：每边中心各 1 个 = 4 个
 */
export const FLOW_HANDLES_SMALL: FlowHandle[] = FLOW_HANDLES.filter(h =>
  ['t2', 'r2', 'b2', 'l2'].includes(h.id)
)

/**
 * Medium 层级：4 中心 + 4 角 = 8 个
 */
export const FLOW_HANDLES_MEDIUM: FlowHandle[] = FLOW_HANDLES.filter(h =>
  ['t2', 'r2', 'b2', 'l2', 'tl', 'tr', 'bl', 'br'].includes(h.id)
)
```

- [ ] **Step 2: Update FlowNode to use dynamic handles**

In `src/runtime/components/flow/FlowNode.client.vue`:

1. Import new constants:
```ts
import { FLOW_HANDLES, FLOW_HANDLES_SMALL, FLOW_HANDLES_MEDIUM, FLOW_HANDLE_TIER_THRESHOLDS } from '#v/constants'
```

2. Add computed for active handles:
```ts
const activeHandles = computed(() => {
  const w = props.data.width ?? 120
  const h = props.data.height ?? 40
  const t = FLOW_HANDLE_TIER_THRESHOLDS
  if (w < t.small.maxWidth || h < t.small.maxHeight) return FLOW_HANDLES_SMALL
  if (w < t.medium.maxWidth || h < t.medium.maxHeight) return FLOW_HANDLES_MEDIUM
  return FLOW_HANDLES
})
```

3. Replace `v-for="handle in FLOW_HANDLES"` with `v-for="handle in activeHandles"` in template.

- [ ] **Step 3: Verify build passes**

Run: `pnpm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/runtime/constants/flow.ts src/runtime/components/flow/FlowNode.client.vue
git commit -m "feat(flow): dynamic handle count based on node size (3-tier strategy)"
```

---

### Task 6: Flow API Composable

**Files:**
- Modify: `src/runtime/types/components/flow.ts`
- Create: `src/runtime/composables/api/useFlowApi.ts`
- Modify: `src/runtime/composables/api/index.ts`

**Context:** Follow `useTableApi` pattern exactly. The `useTableApi` is:
```ts
import { createSharedComposable } from '@vueuse/core'
import { useApi } from './useApi'
import type { ApiGroup, Table } from '#v/types'

export const useTableApi = createSharedComposable((): ApiGroup<Table> => ({
  ...useApi<Table>('/tables')
}))
```

- [ ] **Step 1: Extend Flow type with API fields**

In `src/runtime/types/components/flow.ts`, update the `Flow` interface:

```ts
export interface Flow {
  id?: number | string
  name?: string
  nodes?: FlowNode[]
  edges?: FlowEdge[]
}
```

Add `id` and `name` as optional fields. `nodes` and `edges` remain optional (they already are).

- [ ] **Step 2: Create useFlowApi.ts**

Create `src/runtime/composables/api/useFlowApi.ts`:

```ts
import { createSharedComposable } from '@vueuse/core'
import { useApi } from './useApi'
import type { ApiGroup, Flow } from '#v/types'

export const useFlowApi = createSharedComposable((): ApiGroup<Flow> => ({
  ...useApi<Flow>('/flows')
}))
```

- [ ] **Step 3: Export from api/index.ts**

In `src/runtime/composables/api/index.ts`, add:

```ts
export * from './useFlowApi'
```

- [ ] **Step 4: Verify build passes**

Run: `pnpm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/runtime/types/components/flow.ts src/runtime/composables/api/useFlowApi.ts src/runtime/composables/api/index.ts
git commit -m "feat(flow): add useFlowApi composable following useTableApi pattern"
```
