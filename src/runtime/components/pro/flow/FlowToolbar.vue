<script setup lang="ts">
defineProps<{
  onAddNode?: () => void
  edgeStrokeWidth?: number
  edgeMarkerStart?: boolean
  edgeMarkerEnd?: boolean
  nodeBorderWidth?: number
  onEdgeStrokeWidthChange?: (width: number) => void
  onToggleEdgeMarkerStart?: () => void
  onToggleEdgeMarkerEnd?: () => void
  onNodeBorderWidthChange?: (width: number) => void
}>()
</script>

<template>
  <div class="bg-default rounded-md p-1.5 flex gap-1.5 shadow-sm">
    <!-- 添加节点 -->
    <UButton
      label="节点"
      icon="i-lucide-circle-plus"
      size="sm"
      variant="subtle"
      @click="onAddNode?.()"
    />

    <!-- 样式设置 -->
    <UPopover :content="{ side: 'top' }" :ui="{ content: 'px-6 py-4 flex flex-col gap-4' }">
      <UButton
        label="设置"
        icon="i-lucide-settings"
        size="sm"
        variant="subtle"
      />
      <template #content>
        <fieldset>
          <legend class="text-[11px] leading-none font-semibold mb-2">
            连接线粗细
          </legend>

          <div class="grid grid-cols-5 gap-2 -mx-2">
            <ProButtonTheme
              v-for="width in [1, 2, 3, 4, 5]"
              :key="width"
              :label="width.toString()"
              :selected="edgeStrokeWidth === width"
              class="justify-center min-w-10"
              @click="onEdgeStrokeWidthChange?.(width)"
            >
              <template #leading>
                <div class="flex flex-col gap-px">
                  <div
                    v-for="i in width"
                    :key="i"
                    class="w-4 h-0.5 bg-current rounded-full"
                  />
                </div>
              </template>
            </ProButtonTheme>
          </div>
        </fieldset>

        <fieldset>
          <legend class="text-[11px] leading-none font-semibold mb-2">
            连接线箭头
          </legend>

          <div class="grid grid-cols-2 gap-2 -mx-2">
            <ProButtonTheme
              label="起点"
              :icon="edgeMarkerStart ? 'i-lucide-arrow-left' : 'i-lucide-minus'"
              :selected="edgeMarkerStart"
              @click="onToggleEdgeMarkerStart?.()"
            />
            <ProButtonTheme
              label="终点"
              :icon="edgeMarkerEnd ? 'i-lucide-arrow-right' : 'i-lucide-minus'"
              :selected="edgeMarkerEnd"
              @click="onToggleEdgeMarkerEnd?.()"
            />
          </div>
        </fieldset>

        <fieldset>
          <legend class="text-[11px] leading-none font-semibold mb-2">
            节点边框粗细
          </legend>

          <div class="grid grid-cols-5 gap-2 -mx-2">
            <ProButtonTheme
              v-for="width in [1, 2, 3, 4, 5]"
              :key="width"
              :label="width.toString()"
              :selected="nodeBorderWidth === width"
              class="justify-center"
              @click="onNodeBorderWidthChange?.(width)"
            >
              <template #leading>
                <div class="flex flex-col gap-px">
                  <div
                    v-for="i in width"
                    :key="i"
                    class="w-4 h-0.5 bg-current rounded-full"
                  />
                </div>
              </template>
            </ProButtonTheme>
          </div>
        </fieldset>
      </template>
    </UPopover>
  </div>
</template>
