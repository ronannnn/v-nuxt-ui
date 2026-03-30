<script setup lang="ts">
import { computed } from 'vue'
import type { ButtonProps } from '@nuxt/ui'

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

// 规范 percent：如果所有 percent <= 1，则视为小数（乘 100）；
// 然后缩放使总和为 100（保证“所有 circle 加起来是一个完整的圈”）
const normalizedSegments = computed(() => {
  const raw = props.arcs || []
  if (!raw.length) return []

  const allFraction = raw.every(i => (i.percent ?? 0) <= 1)
  const percents = raw.map(i => Math.max(0, (i.percent ?? 0) * (allFraction ? 100 : 1)))

  const total = percents.reduce((s, v) => s + v, 0)
  if (total <= 0) return raw.map(() => ({ percent: 0, color: undefined }))

  // 缩放到总和为 100（保留颜色）
  return raw.map((it, idx) => ({
    percent: (percents[idx]! / total) * 100,
    color: it.color
  }))
})

const colorClassOf = (color?: ButtonProps['color']) => {
  if (!color || color === 'neutral') return 'text-neutral-300 dark:text-neutral-600 duration-512'
  return `text-${String(color)} duration-512`
}
</script>

<template>
  <div class="relative">
    <svg class="size-full -rotate-90" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
      <!-- 背景圆 -->
      <circle
        cx="18"
        cy="18"
        r="16"
        fill="none"
        class="stroke-current text-neutral-200 dark:text-neutral-700"
        :stroke-width="strokeWidth"
      />

      <!-- 分段进度（从第一个到最后按顺序渲染，合起来为一整圈） -->
      <template v-for="(seg, idx) in normalizedSegments" :key="idx">
        <circle
          v-if="seg.percent > 0.0001"
          cx="18"
          cy="18"
          r="16"
          fill="none"
          stroke-linecap="round"
          :stroke-width="strokeWidth"
          :stroke-dasharray="`${seg.percent} ${100}`"
          :stroke-dashoffset="`${-normalizedSegments.slice(0, idx).reduce((s, v) => s + v.percent, 0)}`"
          class="stroke-current transition-discrete"
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
