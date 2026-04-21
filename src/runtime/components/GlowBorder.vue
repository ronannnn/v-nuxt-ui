<script setup lang="ts">
import { computed } from 'vue'

/**
 * GlowBorder
 * 通用流光边框容器：旋转 conic-gradient + blur 模拟边框流光。
 * 参考 inspira-ui GradientButton 实现思路。
 *
 * - 始终保留 padding 空间，切换 active 时内容尺寸稳定不抖动。
 * - active=false 时只是不渲染流光，结构与样式不变。
 */
const props = withDefaults(
  defineProps<{
    /** 是否启用流光效果 */
    active?: boolean
    /** 流光颜色数组（conic-gradient 顺序） */
    colors?: string[]
    /** 边框宽度 px */
    borderWidth?: number
    /** 外圆角 px */
    borderRadius?: number
    /** 内层圆角 px，默认 borderRadius - borderWidth */
    innerBorderRadius?: number
    /** 旋转一圈耗时 s */
    duration?: number
    /** 流光模糊度 px */
    blur?: number
    /** 选中时的缩放系数 */
    scale?: number
    /** 选中时的投影 */
    shadow?: string
  }>(),
  {
    colors: () => [
      '#ef4444',
      '#f97316',
      '#fbbf24',
      '#84cc16',
      '#06b6d4',
      '#6366f1',
      '#ec4899',
      '#ef4444'
    ],
    borderWidth: 2,
    borderRadius: 10,
    duration: 3,
    blur: 10,
    scale: 1.02,
    shadow: '0 9px 9px rgba(0, 0, 0, 0.35)'
  }
)

const styleVars = computed(() => ({
  '--gb-radius': `${props.borderRadius}px`,
  '--gb-inner-radius': `${props.innerBorderRadius ?? Math.max(0, props.borderRadius - props.borderWidth)}px`,
  '--gb-padding': `${props.borderWidth}px`,
  '--gb-duration': `${props.duration}s`,
  '--gb-blur': `${props.blur}px`,
  '--gb-gradient': `conic-gradient(${props.colors.join(',')})`,
  '--gb-scale': props.scale,
  '--gb-shadow': props.shadow
}))
</script>

<template>
  <div
    class="glow-border relative"
    :class="{ 'glow-border--active': active }"
    :style="styleVars"
  >
    <div class="glow-border__inner relative size-full">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.glow-border {
  border-radius: var(--gb-radius);
  /* 始终保留边框空间，避免切换 active 时内容被挤压 */
  padding: var(--gb-padding);
  overflow: hidden;
  isolation: isolate;
}

.glow-border::before {
  content: '';
  position: absolute;
  inset: -200%;
  z-index: 0;
  background: var(--gb-gradient);
  filter: blur(var(--gb-blur));
  opacity: 0;
  transform: rotate(0deg);
  transition: opacity 0.2s ease-in-out;
  animation: glow-border-rotate var(--gb-duration) linear infinite;
  animation-play-state: paused;
  pointer-events: none;
}

.glow-border__inner {
  position: relative;
  z-index: 1;
  border-radius: var(--gb-inner-radius);
  /* 默认底色用于盖住流光中心，只露出 padding 形成边框；可被 slot 内部背景覆盖 */
  background: var(--ui-bg);
}

.glow-border--active::before {
  opacity: 1;
  animation-play-state: running;
}

@keyframes glow-border-rotate {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .glow-border,
  .glow-border::before {
    transition: opacity 0.2s ease-in-out;
    animation: none;
  }
}
</style>
