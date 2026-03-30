<script setup lang="ts">
import { ref, computed, useTemplateRef, onMounted, onUnmounted } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import {
  ScrollAreaRoot,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport
} from 'reka-ui'

const props = defineProps<{
  enableTopTransparent?: boolean
  enableBottomTransparent?: boolean
  enableLeftTransparent?: boolean
  enableRightTransparent?: boolean
  enableHorizontalTooltip?: boolean
  onScrollEvent?: (ele: HTMLElement) => void
}>()

// following tooltip
const open = ref(false)
const anchor = ref({ x: 0, y: 0 })
const reference = computed(() => ({
  getBoundingClientRect: () =>
    ({
      width: 0,
      height: 0,
      left: anchor.value.x,
      right: anchor.value.x,
      top: anchor.value.y,
      bottom: anchor.value.y,
      ...anchor.value
    }) as DOMRect
}))

// 用于判断是否滑到底
const scrollArea = useTemplateRef('scrollArea')
const isAtTop = ref(false)
const isAtBottom = ref(false)
const isAtLeft = ref(false)
const isAtRight = ref(false)
const onDetectBoundary = () => {
  const viewport = scrollArea.value?.viewport
  if (!viewport) {
    return
  }
  const {
    scrollTop,
    scrollLeft,
    clientHeight,
    clientWidth,
    scrollHeight,
    scrollWidth
  } = viewport
  isAtTop.value = scrollTop <= 1
  isAtBottom.value = scrollTop + clientHeight >= scrollHeight - 1
  isAtLeft.value = scrollLeft <= 1
  isAtRight.value = scrollLeft + clientWidth >= scrollWidth - 1
}
const onScroll = useDebounceFn(() => {
  onDetectBoundary()
  const viewport = scrollArea.value?.viewport
  if (!viewport) {
    return
  }
  props.onScrollEvent?.(viewport)
}, 128)

// 绝对位置滚动
const scrollHorizontally = (targetX: number) => {
  const viewport = scrollArea.value?.viewport
  if (!viewport) {
    return
  }

  const viewportRect = viewport.getBoundingClientRect()

  viewport.scrollTo({
    left:
      targetX
      - (viewportRect.left + viewportRect.width / 2)
      + viewport.scrollLeft,
    behavior: 'smooth'
  })
}

// 绝对位置滚动
const scrollVertically = (targetY: number) => {
  const viewport = scrollArea.value?.viewport
  if (!viewport) {
    return
  }

  // 如果传入的是相对位置（页面坐标），转换为相对于 viewport 的位置
  const viewportRect = viewport.getBoundingClientRect()

  viewport.scrollTo({
    top:
      targetY
      - (viewportRect.top + viewportRect.height / 2)
      + viewport.scrollTop,
    behavior: 'smooth'
  })
}

// 相对增量的滚动方法
const scrollHorizontallyBy = (
  deltaX: number,
  behavior: ScrollBehavior = 'auto'
) => {
  const viewport = scrollArea.value?.viewport
  if (!viewport) {
    return
  }

  viewport.scrollTo({
    left: viewport.scrollLeft + deltaX,
    behavior: behavior
  })
}

// 相对增量的滚动方法
const scrollVerticallyBy = (
  deltaY: number,
  behavior: ScrollBehavior = 'auto'
) => {
  const viewport = scrollArea.value?.viewport
  if (!viewport) {
    return
  }

  viewport.scrollTo({
    top: viewport.scrollTop + deltaY,
    behavior: behavior
  })
}

defineExpose({
  scrollHorizontally,
  scrollVertically,
  scrollHorizontallyBy,
  scrollVerticallyBy
})

// 否则一开始模糊边界都会显示出来
onMounted(() => {
  onScroll()
  window.addEventListener('resize', onScroll)
})

onUnmounted(() => {
  window.removeEventListener('resize', onScroll)
})
</script>

<template>
  <ScrollAreaRoot
    ref="scrollArea"
    class="relative overflow-hidden size-full"
    type="hover"
    :scroll-hide-delay="256"
  >
    <!-- 边缘渐变装饰 -->
    <Transition name="fade">
      <div
        v-if="enableTopTransparent && !isAtTop"
        class="absolute top-0 z-10 w-full h-6 bg-linear-to-t from-transparent to-default"
      />
    </Transition>
    <Transition name="fade">
      <div
        v-if="enableBottomTransparent && !isAtBottom"
        class="absolute bottom-0 z-10 w-full h-6 bg-linear-to-b from-transparent to-default"
      />
    </Transition>
    <Transition name="fade">
      <div
        v-if="enableLeftTransparent && !isAtLeft"
        class="absolute left-0 z-10 h-full w-6 bg-linear-to-l from-transparent to-default"
      />
    </Transition>
    <Transition name="fade">
      <div
        v-if="enableRightTransparent && !isAtRight"
        class="absolute right-0 z-10 h-full w-6 bg-linear-to-r from-transparent to-default"
      />
    </Transition>

    <ScrollAreaViewport class="size-full overscroll-contain" @scroll="onScroll">
      <slot />
    </ScrollAreaViewport>

    <ScrollAreaScrollbar
      class="flex select-none touch-none p-0.5 z-99 data-[state=visible]:animate-[fade-in_300ms_ease-in] data-[state=hidden]:animate-[fade-out_300ms_ease-out] data-[orientation=vertical]:w-2 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2"
      orientation="vertical"
    >
      <ScrollAreaThumb
        class="flex-1 transition-colors bg-neutral-400/50 hover:bg-neutral-500/50 dark:bg-neutral-500/50 dark:hover:bg-neutral-400/50 rounded-full relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-10 before:min-h-10"
      />
    </ScrollAreaScrollbar>

    <ScrollAreaScrollbar
      class="flex select-none touch-none p-0.5 z-99 data-[state=visible]:animate-[fade-in_300ms_ease-in] data-[state=hidden]:animate-[fade-out_300ms_ease-out] data-[orientation=vertical]:w-2 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2"
      orientation="horizontal"
    >
      <UTooltip
        :delay-duration="100"
        :open="open && enableHorizontalTooltip === true"
        :reference="reference"
        :content="{
          side: 'top',
          sideOffset: 10,
          updatePositionStrategy: 'always'
        }"
        :disabled="!enableHorizontalTooltip"
      >
        <ScrollAreaThumb
          class="flex-1 transition-colors bg-neutral-400/50 hover:bg-neutral-500/50 dark:bg-neutral-500/50 dark:hover:bg-neutral-400/50 rounded-full relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full"
          :class="enableHorizontalTooltip && 'before:min-w-10 before:min-h-10'"
          @pointerenter="open = true"
          @pointerleave="open = false"
          @pointermove="
            (ev: PointerEvent) => {
              anchor.x = ev.clientX;
              anchor.y = ev.clientY;
            }
          "
        />
        <template #content>
          <UKbd value="Shift" size="sm" />+<UKbd
            value="鼠标滚轮"
            size="sm"
          />可进行左右滚动
        </template>
      </UTooltip>
    </ScrollAreaScrollbar>
  </ScrollAreaRoot>
</template>
