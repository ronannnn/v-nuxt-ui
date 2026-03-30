<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  text?: string
  textColor?: ButtonProps['color']
  textClass?: string
  strokeWidth?: number
  arcs?: {
    percent?: number
    color?: ButtonProps['color']
  }[]
}>(), {
  strokeWidth: 2,
  textColor: 'neutral',
  items: () => []
})

const RADIUS = 16
const CIRCUMFERENCE = 2 * Math.PI * RADIUS // ≈ 100.53

// 规范 percent：如果所有 percent <= 1，则视为小数（乘 100）；
// 不再强制缩放到 100，保留原始百分比，总和超过 100 时才裁剪
const normalizedSegments = computed(() => {
  const raw = props.arcs || []
  if (!raw.length) return []

  const allFraction = raw.every(i => (i.percent ?? 0) <= 1)
  const percents = raw.map(i => Math.max(0, (i.percent ?? 0) * (allFraction ? 100 : 1)))

  const total = percents.reduce((s, v) => s + v, 0)
  if (total <= 0) return raw.map(() => ({ percent: 0, color: undefined }))

  // 仅当总和超过 100 时才按比例缩放，否则保留原始百分比（未填满的部分显示灰色背景）
  const scale = total > 100 ? 100 / total : 1
  return raw.map((it, idx) => ({
    percent: percents[idx]! * scale,
    color: it.color
  }))
})

// 将百分比转换为 SVG stroke-dasharray 的实际长度
const dashLength = (percent: number) => (percent / 100) * CIRCUMFERENCE
// 计算 stroke-dashoffset：正 offset 让 dash 向绘制方向的反方向偏移
// SVG circle 原生逆时针绘制，配合 rotate(-90deg)，正 offset 实现视觉上的顺时针排列
const dashOffset = (idx: number) => {
  const preceding = normalizedSegments.value.slice(0, idx).reduce((s, v) => s + dashLength(v.percent), 0)
  return -preceding
}

const colorClassOf = (color?: ButtonProps['color']) => {
  if (!color || color === 'neutral') return 'text-dimmed duration-512'
  return `text-${String(color)} duration-512`
}
</script>

<template>
  <div class="relative">
    <svg style="transform: rotate(-90deg);" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
      <!-- 背景圆 -->
      <circle
        cx="18"
        cy="18"
        r="16"
        fill="none"
        stroke="currentColor"
        class="text-dimmed"
        :stroke-width="strokeWidth"
      />

      <!-- 分段进度（从第一个到最后按顺序渲染，未填满部分透出灰色背景） -->
      <template v-for="(seg, idx) in normalizedSegments" :key="idx">
        <circle
          v-if="seg.percent > 0.0001"
          cx="18"
          cy="18"
          r="16"
          fill="none"
          stroke-linecap="round"
          :stroke-width="strokeWidth"
          :stroke-dasharray="`${dashLength(seg.percent)} ${CIRCUMFERENCE}`"
          :stroke-dashoffset="dashOffset(idx)"
          stroke="currentColor"
          class="transition-discrete"
          :class="colorClassOf(seg.color)"
        />
      </template>
    </svg>

    <div class="absolute inset-0 flex items-center justify-center">
      <span :class="`${colorClassOf(textColor)} ${textClass}`">
        {{ props.text }}
      </span>
    </div>
  </div>
</template>
