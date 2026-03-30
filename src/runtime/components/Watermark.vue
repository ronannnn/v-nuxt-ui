<script setup lang="ts">
import { useColorMode } from '@vueuse/core'
import { ref, onMounted, watch } from 'vue'

interface Props {
  text?: string | string[]
  fontSize?: number
  fontWeight?: string | number
  fontFamily?: string
  fontColor?: string
  lineHeight?: number
  rotate?: number
  gap?: number
  opacity?: number
  disabled?: boolean
  debug?: boolean
  textAlign?: 'left' | 'center' | 'right'
  xOffset?: number
  yOffset?: number
  zIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
  text: 'Watermark',
  fontSize: 13,
  fontWeight: 300,
  fontColor: 'text-neutral-200 dark:text-neutral-700',
  lineHeight: 16,
  rotate: -16,
  gap: 128,
  opacity: 0.6,
  disabled: false,
  debug: false,
  textAlign: 'center',
  xOffset: 0,
  yOffset: 0
})

const watermarkStyle = ref('')
const canvas = import.meta.client ? document.createElement('canvas') : null
const ctx = canvas ? canvas.getContext('2d') : null

// 获取精确的像素比
function getRatio(context: CanvasRenderingContext2D | null): number {
  if (!context) return 1

  const backingStore = (context as any).backingStorePixelRatio
    || (context as any).webkitBackingStorePixelRatio
    || (context as any).mozBackingStorePixelRatio
    || (context as any).msBackingStorePixelRatio
    || (context as any).oBackingStorePixelRatio
    || 1

  return (window.devicePixelRatio || 1) / backingStore
}

// 获取 Tailwind 颜色值
const getTailwindColor = (className: string): string => {
  if (!import.meta.client) return props.fontColor

  const tempElement = document.createElement('div')
  tempElement.className = className
  tempElement.style.position = 'absolute'
  tempElement.style.visibility = 'hidden'
  document.body.appendChild(tempElement)

  const computedColor = getComputedStyle(tempElement).color
  document.body.removeChild(tempElement)

  return computedColor
}

// 等待字体加载完成
const fontsReady = ref(false)
onMounted(async () => {
  if (import.meta.client && 'fonts' in document) {
    try {
      await document.fonts.ready
      fontsReady.value = true
    } catch {
      // 如果字体 API 不支持，直接标记为就绪
      fontsReady.value = true
    }
  } else {
    fontsReady.value = true
  }
})

const generateWatermark = () => {
  if (props.disabled || !props.text || !canvas || !ctx || !fontsReady.value) {
    watermarkStyle.value = ''
    return
  }

  const ratio = getRatio(ctx)

  // 获取颜色值
  let color = props.fontColor
  if (color.startsWith('text-') || color.includes('dark:')) {
    color = getTailwindColor(color)
  }

  // 设置字体并测量文字
  const fontSize = props.fontSize * ratio
  const lineHeight = props.lineHeight * ratio
  ctx.font = `${props.fontWeight} ${fontSize}px ${props.fontFamily}`

  const texts = Array.isArray(props.text) ? props.text : [props.text]

  // 计算文字最大宽度和总高度
  let maxWidth = 0
  const textLines = texts.map((line) => {
    const width = ctx.measureText(line).width
    maxWidth = Math.max(maxWidth, width)
    return { line, width }
  })

  const textHeight = texts.length * lineHeight

  // 计算旋转后的边界框
  const rad = (props.rotate * Math.PI) / 180
  const cos = Math.abs(Math.cos(rad))
  const sin = Math.abs(Math.sin(rad))
  const rotatedWidth = maxWidth * cos + textHeight * sin
  const rotatedHeight = maxWidth * sin + textHeight * cos

  // 设置画布大小
  const canvasWidth = Math.ceil(rotatedWidth + props.gap * ratio)
  const canvasHeight = Math.ceil(rotatedHeight + props.gap * ratio)

  canvas.width = canvasWidth
  canvas.height = canvasHeight

  // 清除画布
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  // 设置抗锯齿
  ctx.imageSmoothingEnabled = true

  // 设置字体和颜色
  ctx.font = `${props.fontWeight} ${fontSize}px ${props.fontFamily}`
  ctx.fillStyle = color
  ctx.textBaseline = 'top'

  // 移动到画布中心
  ctx.translate(canvasWidth / 2, canvasHeight / 2)

  // 旋转
  ctx.rotate(rad)

  // 调试模式：绘制边界框
  if (props.debug) {
    ctx.strokeStyle = 'red'
    ctx.strokeRect(-maxWidth / 2, -textHeight / 2, maxWidth, textHeight)
  }

  // 绘制文字
  textLines.forEach(({ line, width }, index) => {
    let alignOffset = 0

    switch (props.textAlign) {
      case 'left':
        alignOffset = -maxWidth / 2
        break
      case 'center':
        alignOffset = -width / 2
        break
      case 'right':
        alignOffset = maxWidth / 2 - width
        break
    }

    const x = alignOffset + props.xOffset * ratio
    const y = -textHeight / 2 + index * lineHeight + props.yOffset * ratio

    ctx.fillText(line, x, y)
  })

  // 生成样式
  const dataURL = canvas.toDataURL('image/png')
  const styleWidth = canvasWidth / ratio
  const styleHeight = canvasHeight / ratio

  watermarkStyle.value = `
    background-image: url(${dataURL});
    background-repeat: repeat;
    background-size: ${styleWidth}px ${styleHeight}px;
  `
}

// 监听变化
watch(
  () => [
    props.text, props.fontSize, props.fontWeight, props.fontFamily,
    props.fontColor, props.lineHeight, props.rotate, props.gap,
    props.disabled, props.textAlign, props.xOffset, props.yOffset,
    fontsReady.value
  ],
  generateWatermark,
  { immediate: true, deep: true }
)

// 监听主题变化
const colorMode = useColorMode()
watch(() => colorMode.value, generateWatermark)

onMounted(() => {
  generateWatermark()
})
</script>

<template>
  <div class="relative flex overflow-hidden size-full">
    <!-- 水印层 -->
    <div
      v-if="!disabled && watermarkStyle"
      class="absolute inset-0 pointer-events-none select-none"
      :style="`
        ${watermarkStyle}
        opacity: ${opacity};
        z-index: ${zIndex ?? 0};
      `"
    />

    <!-- 内容 -->
    <slot />
  </div>
</template>
