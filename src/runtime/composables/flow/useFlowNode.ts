import { ref, computed, inject, onMounted, onBeforeUnmount } from 'vue'
import type { Ref } from 'vue'
import {
  FLOW_HANDLES,
  FLOW_HANDLE_TIER_THRESHOLDS,
  FLOW_MOUSE_POSITION_KEY,
  FLOW_NODE_PROXIMITY_THRESHOLD
} from '#v/constants'
import type { FlowHandle } from '#v/constants'
import { handleSizePreview } from './useFlowStyles'

interface UseFlowNodeOptions {
  /** 节点 data (reactive) */
  data: Ref<any>
  /** 是否选中 (reactive) */
  selected: Ref<boolean>
}

export function useFlowNode(options: UseFlowNodeOptions) {
  const { data, selected } = options

  const nodeRef = ref<HTMLElement | null>(null)
  const isHoveredLocal = ref(false)

  const injectedMousePosition = inject(FLOW_MOUSE_POSITION_KEY, null)
  const localMousePosition = ref({ x: 0, y: 0 })
  const mousePosition = computed(() => injectedMousePosition?.value ?? localMousePosition.value)

  const borderColor = computed(() => {
    if (selected.value) return 'var(--ui-primary)'
    // 使用用户设置的边框颜色，若为空则用默认边框色
    if (data.value.borderColor) return data.value.borderColor
    return 'var(--ui-border-default)'
  })

  const isNearby = computed(() => {
    if (!nodeRef.value) return false

    const rect = nodeRef.value.getBoundingClientRect()
    const mouseX = mousePosition.value.x
    const mouseY = mousePosition.value.y

    const dx = Math.max(rect.left - mouseX, 0, mouseX - rect.right)
    const dy = Math.max(rect.top - mouseY, 0, mouseY - rect.bottom)
    const distance = Math.sqrt(dx * dx + dy * dy)

    return distance <= FLOW_NODE_PROXIMITY_THRESHOLD
  })

  const showHandles = computed(() => isHoveredLocal.value || isNearby.value || handleSizePreview.value)

  // 根据节点宽高独立判断各轴 handle 层级
  // tier: 0 = small (仅中心), 1 = medium (+ 角), 2 = full (+ 25%/75%)
  const activeHandles = computed(() => {
    const w = data.value.width ?? 120
    const h = data.value.height ?? 40
    const t = FLOW_HANDLE_TIER_THRESHOLDS

    const hTier = w < t.small.maxWidth ? 0 : w < t.medium.maxWidth ? 1 : 2
    const vTier = h < t.small.maxHeight ? 0 : h < t.medium.maxHeight ? 1 : 2

    return FLOW_HANDLES.filter((handle) => {
      const id = handle.id
      // 水平边中心 (t2/b2) — 始终显示
      if (id === 't2' || id === 'b2') return true
      // 垂直边中心 (r2/l2) — 始终显示
      if (id === 'r2' || id === 'l2') return true
      // 4 角 — 两轴都 >= medium
      if (id === 'tl' || id === 'tr' || id === 'bl' || id === 'br') return true
      // 水平边 25%/75% (t1/t3/b1/b3) — 需要 hTier = full
      if (id === 't1' || id === 't3' || id === 'b1' || id === 'b3') return hTier >= 2
      // 垂直边 25%/75% (r1/r3/l1/l3) — 需要 vTier = full
      if (id === 'r1' || id === 'r3' || id === 'l1' || id === 'l3') return vTier >= 2
      return false
    })
  })

  // 计算 handle 样式，使其居中在 border 线上
  const handleStyle = (handle: FlowHandle) => {
    const bw = data.value.borderWidth ?? 2
    const handleSize = data.value.handleSize ?? 6
    // absolutely positioned 子元素的坐标原点是 padding box 边缘（border 内侧）
    // 需要向外偏移 bw/2 才能让 handle 居中在 border 线上
    const offset = -(bw / 2)

    const base: Record<string, string | number | undefined> = {
      pointerEvents: 'all',
      opacity: showHandles.value ? 1 : 0,
      transition: 'opacity 0.2s',
      width: `${handleSize}px`,
      height: `${handleSize}px`,
      zIndex: 20,
      borderRadius: '50%'
    }

    // 覆盖 VueFlow 默认的 top/bottom/left/right，使其对齐 border 中心线
    const pos = handle.position
    if (pos === 'top') {
      base.top = `${offset}px`
    } else if (pos === 'bottom') {
      base.bottom = `${offset}px`
    } else if (pos === 'left') {
      base.left = `${offset}px`
    } else if (pos === 'right') {
      base.right = `${offset}px`
    }

    // 覆盖 left/top 百分比（相对 padding box），补偿 border 宽度
    if (handle.offsetPercent?.x !== undefined) {
      const pct = handle.offsetPercent.x
      // 在 padding box 坐标系中：border 外左边缘 = -bw, 外右边缘 = 100% + bw
      // border 中心线：左 = -bw/2, 右 = 100% + bw/2
      // X% of border box 映射到 padding box: -bw/2 + X% * (paddingBoxWidth + bw) / paddingBoxWidth
      // 简化: calc(X% + (X/50 - 1) * bw/2)
      const shift = (pct / 50 - 1) * (bw / 2) // -bw/2 at 0%, 0 at 50%, +bw/2 at 100%
      base.left = `calc(${pct}% + ${shift}px)`
    }

    if (handle.offsetPercent?.y !== undefined) {
      const pct = handle.offsetPercent.y
      const shift = (pct / 50 - 1) * (bw / 2)
      base.top = `calc(${pct}% + ${shift}px)`
    }

    return base
  }

  // 全局鼠标移动监听（仅在未注入共享鼠标位置时使用）
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

  return {
    nodeRef,
    isHoveredLocal,
    borderColor,
    showHandles,
    activeHandles,
    handleStyle
  }
}
