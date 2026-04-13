<script setup lang="ts">
import { ref } from 'vue'
import {
  FLOW_EDGE_COLORS, FLOW_NODE_COLORS, FLOW_NODE_BORDER_COLORS, FLOW_FONT_COLORS,
  FLOW_WIDTH_ITEMS, FLOW_STROKE_TYPE_ITEMS, FLOW_PATH_TYPE_ITEMS, FLOW_ARROW_TYPE_ITEMS,
  FLOW_BORDER_RADIUS_ITEMS, FLOW_FONT_SIZE_ITEMS, FLOW_HANDLE_SIZE_ITEMS,
  FLOW_PATH_PREVIEW, FLOW_ARROW_PREVIEW_START, FLOW_ARROW_PREVIEW_END
} from '#v/constants'
import type { FlowEdgeStrokeType, FlowEdgePathType, FlowArrowType } from '#v/constants'
import type { TabsItem } from '@nuxt/ui'
import FlowToolbarItemWrapper from './FlowToolbarItemWrapper.vue'
import CircleColor from '#v/components/button/CircleColor.vue'

const settingsOpen = ref(false)

defineProps<{
  onAddNode?: () => void
  edgeStrokeWidth?: number
  edgeStrokeType?: FlowEdgeStrokeType
  edgePathType?: FlowEdgePathType
  edgeMarkerStart?: FlowArrowType
  edgeMarkerEnd?: FlowArrowType
  edgeAnimated?: boolean
  edgeColor?: string
  edgeLabelColor?: string
  nodeBorderWidth?: number
  nodeBorderRadius?: number
  nodeBorderColor?: string
  nodeBgColor?: string
  nodeFontColor?: string
  nodeFontSize?: number
  nodeHandleSize?: number
  onEdgeStrokeWidthChange: (width: number) => void
  onEdgeStrokeTypeChange?: (type: FlowEdgeStrokeType) => void
  onEdgePathTypeChange?: (type: FlowEdgePathType) => void
  onEdgeMarkerStartChange?: (type: FlowArrowType) => void
  onEdgeMarkerEndChange?: (type: FlowArrowType) => void
  onToggleEdgeAnimated?: () => void
  onEdgeColorChange?: (color: string) => void
  onEdgeLabelColorChange?: (color: string) => void
  onNodeBorderWidthChange?: (width: number) => void
  onNodeBorderRadiusChange?: (radius: number) => void
  onNodeBorderColorChange?: (color: string) => void
  onNodeBgColorChange?: (color: string) => void
  onNodeFontColorChange?: (color: string) => void
  onNodeFontSizeChange?: (size: number) => void
  onNodeHandleSizeChange?: (size: number) => void
}>()

const tabItems: TabsItem[] = [
  { label: '节点设置', value: 'node', slot: 'node' },
  { label: '连接线设置', value: 'edge', slot: 'edge' }
]

const itemSize = 'sm'

// helpers: look up item data by selected value for #leading slot
function getStrokeDasharray(value: FlowEdgeStrokeType) {
  return FLOW_STROKE_TYPE_ITEMS.find(i => i.value === value)?.dasharray || 'none'
}
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
    <UButton
      icon="i-lucide-settings"
      size="sm"
      variant="subtle"
      @click="settingsOpen = true"
    />

    <USlideover
      v-model:open="settingsOpen"
      title="样式设置"
      side="right"
      inset
      :overlay="false"
    >
      <template #body>
        <UTabs
          :items="tabItems"
          size="xs"
          default-value="node"
          :ui="{
            content: 'pt-3'
          }"
        >
          <template #node>
            <div class="flex flex-col gap-4">
              <!-- 边框粗细 -->
              <FlowToolbarItemWrapper label="边框粗细">
                <USelect
                  :model-value="nodeBorderWidth"
                  :items="FLOW_WIDTH_ITEMS"
                  :size="itemSize"
                  trailing-icon=""
                  @update:model-value="(v: number) => onNodeBorderWidthChange?.(v)"
                >
                  <template #item-leading="{ item }">
                    <div
                      class="w-4 bg-current rounded-full"
                      :style="{
                        height: `${item.value}px`
                      }"
                    />
                  </template>
                  <template #leading="{ modelValue }">
                    <div
                      class="w-4 bg-current rounded-full"
                      :style="{
                        height: `${modelValue}px`
                      }"
                    />
                  </template>
                </USelect>
              </FlowToolbarItemWrapper>

              <!-- 边框颜色 -->
              <FlowToolbarItemWrapper label="边框颜色">
                <div class="grid grid-cols-9 gap-2">
                  <CircleColor
                    v-for="opt in FLOW_NODE_BORDER_COLORS"
                    :key="opt.color"
                    :chip="opt.chip"
                    :shade="500"
                    :selected="nodeBorderColor === opt.color"
                    :title="opt.chip || 'default'"
                    @click="onNodeBorderColorChange?.(opt.color)"
                  />
                </div>
              </FlowToolbarItemWrapper>

              <USeparator class="py-2" />

              <!-- 背景色 -->
              <FlowToolbarItemWrapper label="背景色">
                <div class="grid grid-cols-9 gap-2">
                  <CircleColor
                    v-for="opt in FLOW_NODE_COLORS"
                    :key="opt.color"
                    :chip="opt.chip"
                    :shade="50"
                    :selected="nodeBgColor === opt.color"
                    :title="opt.chip || 'default'"
                    @click="onNodeBgColorChange?.(opt.color)"
                  />
                </div>
              </FlowToolbarItemWrapper>

              <USeparator class="py-2" />

              <!-- 字号 -->
              <FlowToolbarItemWrapper label="字号">
                <USelect
                  :model-value="nodeFontSize"
                  :items="FLOW_FONT_SIZE_ITEMS"
                  :size="itemSize"
                  trailing-icon=""
                  @update:model-value="(v: number) => onNodeFontSizeChange?.(v)"
                >
                  <template #item-leading="{ item }">
                    <span :class="(item as any).twClass">A</span>
                  </template>
                </USelect>
              </FlowToolbarItemWrapper>

              <!-- 字体颜色 -->
              <FlowToolbarItemWrapper label="字体颜色">
                <div class="grid grid-cols-9 gap-2">
                  <CircleColor
                    v-for="opt in FLOW_FONT_COLORS"
                    :key="opt.color"
                    :chip="opt.chip"
                    :shade="600"
                    :selected="nodeFontColor === opt.color"
                    :title="opt.chip || 'default'"
                    @click="onNodeFontColorChange?.(opt.color)"
                  />
                </div>
              </FlowToolbarItemWrapper>

              <USeparator class="py-2" />

              <!-- 圆角 -->
              <FlowToolbarItemWrapper label="圆角">
                <USelect
                  :model-value="nodeBorderRadius"
                  :items="FLOW_BORDER_RADIUS_ITEMS"
                  :size="itemSize"
                  trailing-icon=""
                  @update:model-value="(v: number) => onNodeBorderRadiusChange?.(v)"
                >
                  <template #leading="{ modelValue }">
                    <div
                      v-if="modelValue != null"
                      class="w-4 h-3 border-[1.5px] border-current"
                      :style="{ borderRadius: `${modelValue}px` }"
                    />
                  </template>
                  <template #item-leading="{ item }">
                    <div
                      class="w-4 h-3 border-[1.5px] border-current"
                      :style="{ borderRadius: `${(item as any).value}px` }"
                    />
                  </template>
                </USelect>
              </FlowToolbarItemWrapper>

              <!-- 连接点大小 -->
              <FlowToolbarItemWrapper label="连接点大小">
                <USelect
                  :model-value="nodeHandleSize"
                  :items="FLOW_HANDLE_SIZE_ITEMS"
                  :size="itemSize"
                  trailing-icon=""
                  class="min-h-7"
                  @update:model-value="(v: number) => onNodeHandleSizeChange?.(v)"
                >
                  <template #default="{ modelValue }">
                    <div
                      v-if="modelValue"
                      class="rounded-full bg-current"
                      :style="{ width: `${modelValue}px`, height: `${modelValue}px` }"
                    />
                  </template>
                  <template #item-leading="{ item }">
                    <div
                      class="rounded-full bg-current"
                      :style="{ width: `${(item as any).value}px`, height: `${(item as any).value}px` }"
                    />
                  </template>
                </USelect>
              </FlowToolbarItemWrapper>
            </div>
          </template>

          <template #edge>
            <div class="flex flex-col gap-4">
              <!-- 起点箭头 -->
              <FlowToolbarItemWrapper label="起点箭头">
                <USelect
                  :model-value="edgeMarkerStart"
                  :items="FLOW_ARROW_TYPE_ITEMS"
                  :size="itemSize"
                  trailing-icon=""
                  @update:model-value="(v: FlowArrowType) => onEdgeMarkerStartChange?.(v)"
                >
                  <template #leading="{ modelValue }">
                    <svg
                      v-if="modelValue"
                      width="20"
                      height="10"
                      class="shrink-0"
                    >
                      <component
                        :is="el.tag"
                        v-for="(el, idx) in FLOW_ARROW_PREVIEW_START[modelValue as FlowArrowType]"
                        :key="idx"
                        v-bind="el.attrs"
                      />
                    </svg>
                  </template>
                  <template #item-leading="{ item }">
                    <svg width="20" height="10" class="shrink-0">
                      <component
                        :is="el.tag"
                        v-for="(el, idx) in FLOW_ARROW_PREVIEW_START[(item as any).value as FlowArrowType]"
                        :key="idx"
                        v-bind="el.attrs"
                      />
                    </svg>
                  </template>
                </USelect>
              </FlowToolbarItemWrapper>

              <!-- 终点箭头 -->
              <FlowToolbarItemWrapper label="终点箭头">
                <USelect
                  :model-value="edgeMarkerEnd"
                  :items="FLOW_ARROW_TYPE_ITEMS"
                  :size="itemSize"
                  trailing-icon=""
                  @update:model-value="(v: FlowArrowType) => onEdgeMarkerEndChange?.(v)"
                >
                  <template #leading="{ modelValue }">
                    <svg
                      v-if="modelValue"
                      width="20"
                      height="10"
                      class="shrink-0"
                    >
                      <component
                        :is="el.tag"
                        v-for="(el, idx) in FLOW_ARROW_PREVIEW_END[modelValue as FlowArrowType]"
                        :key="idx"
                        v-bind="el.attrs"
                      />
                    </svg>
                  </template>
                  <template #item-leading="{ item }">
                    <svg width="20" height="10" class="shrink-0">
                      <component
                        :is="el.tag"
                        v-for="(el, idx) in FLOW_ARROW_PREVIEW_END[(item as any).value as FlowArrowType]"
                        :key="idx"
                        v-bind="el.attrs"
                      />
                    </svg>
                  </template>
                </USelect>
              </FlowToolbarItemWrapper>

              <USeparator class="py-2" />

              <!-- 粗细 -->
              <FlowToolbarItemWrapper label="粗细">
                <USelect
                  :model-value="edgeStrokeWidth"
                  :items="FLOW_WIDTH_ITEMS"
                  :size="itemSize"
                  trailing-icon=""
                  @update:model-value="(v: number) => onEdgeStrokeWidthChange?.(v)"
                >
                  <template #leading="{ modelValue }">
                    <div
                      class="w-4 bg-current rounded-full"
                      :style="{
                        height: `${modelValue}px`
                      }"
                    />
                  </template>
                  <template #item-leading="{ item }">
                    <div
                      class="w-4 bg-current rounded-full"
                      :style="{
                        height: `${item.value}px`
                      }"
                    />
                  </template>
                </USelect>
              </FlowToolbarItemWrapper>

              <!-- 线型 -->
              <FlowToolbarItemWrapper label="线型">
                <USelect
                  :model-value="edgeStrokeType"
                  :items="FLOW_STROKE_TYPE_ITEMS"
                  :size="itemSize"
                  trailing-icon=""
                  @update:model-value="(v: FlowEdgeStrokeType) => onEdgeStrokeTypeChange?.(v)"
                >
                  <template #leading="{ modelValue }">
                    <svg
                      v-if="modelValue"
                      width="20"
                      height="10"
                      class="shrink-0"
                    >
                      <line
                        x1="0"
                        y1="5"
                        x2="20"
                        y2="5"
                        stroke="currentColor"
                        stroke-width="2"
                        :stroke-dasharray="getStrokeDasharray(modelValue as FlowEdgeStrokeType)"
                      />
                    </svg>
                  </template>
                  <template #item-leading="{ item }">
                    <svg width="20" height="10" class="shrink-0">
                      <line
                        x1="0"
                        y1="5"
                        x2="20"
                        y2="5"
                        stroke="currentColor"
                        stroke-width="2"
                        :stroke-dasharray="(item as any).dasharray || 'none'"
                      />
                    </svg>
                  </template>
                </USelect>
              </FlowToolbarItemWrapper>

              <!-- 路径 -->
              <FlowToolbarItemWrapper label="路径">
                <USelect
                  :model-value="edgePathType"
                  :items="FLOW_PATH_TYPE_ITEMS"
                  :size="itemSize"
                  trailing-icon=""
                  @update:model-value="(v: FlowEdgePathType) => onEdgePathTypeChange?.(v)"
                >
                  <template #leading="{ modelValue }">
                    <svg
                      v-if="modelValue"
                      width="20"
                      height="14"
                      class="shrink-0"
                    >
                      <template v-if="FLOW_PATH_PREVIEW[modelValue as FlowEdgePathType]?.shape === 'path'">
                        <path
                          :d="FLOW_PATH_PREVIEW[modelValue as FlowEdgePathType].d"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                        />
                      </template>
                      <template v-else>
                        <line
                          v-bind="{ x1: FLOW_PATH_PREVIEW[modelValue as FlowEdgePathType].x1, y1: FLOW_PATH_PREVIEW[modelValue as FlowEdgePathType].y1, x2: FLOW_PATH_PREVIEW[modelValue as FlowEdgePathType].x2, y2: FLOW_PATH_PREVIEW[modelValue as FlowEdgePathType].y2 }"
                          stroke="currentColor"
                          stroke-width="2"
                        />
                      </template>
                    </svg>
                  </template>
                  <template #item-leading="{ item }">
                    <svg width="20" height="14" class="shrink-0">
                      <template v-if="FLOW_PATH_PREVIEW[(item as any).value as FlowEdgePathType]?.shape === 'path'">
                        <path
                          :d="FLOW_PATH_PREVIEW[(item as any).value as FlowEdgePathType].d"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                        />
                      </template>
                      <template v-else>
                        <line
                          v-bind="{ x1: FLOW_PATH_PREVIEW[(item as any).value as FlowEdgePathType].x1, y1: FLOW_PATH_PREVIEW[(item as any).value as FlowEdgePathType].y1, x2: FLOW_PATH_PREVIEW[(item as any).value as FlowEdgePathType].x2, y2: FLOW_PATH_PREVIEW[(item as any).value as FlowEdgePathType].y2 }"
                          stroke="currentColor"
                          stroke-width="2"
                        />
                      </template>
                    </svg>
                  </template>
                </USelect>
              </FlowToolbarItemWrapper>

              <!-- 动画 -->
              <FlowToolbarItemWrapper label="流动动画">
                <div class="flex items-center h-7">
                  <USwitch
                    :model-value="edgeAnimated"
                    size="lg"
                    @update:model-value="onToggleEdgeAnimated?.()"
                  />
                </div>
              </FlowToolbarItemWrapper>

              <!-- 连接线颜色 -->
              <FlowToolbarItemWrapper label="连接线颜色">
                <div class="grid grid-cols-9 gap-2">
                  <CircleColor
                    v-for="opt in FLOW_EDGE_COLORS"
                    :key="opt.color"
                    :chip="opt.chip"
                    :shade="500"
                    :selected="edgeColor === opt.color"
                    :title="opt.chip || 'default'"
                    @click="onEdgeColorChange?.(opt.color)"
                  />
                </div>
              </FlowToolbarItemWrapper>

              <USeparator class="py-2" />

              <!-- 标签颜色 -->
              <FlowToolbarItemWrapper label="标签颜色">
                <div class="grid grid-cols-9 gap-2">
                  <CircleColor
                    v-for="opt in FLOW_FONT_COLORS"
                    :key="opt.color"
                    :chip="opt.chip"
                    :shade="600"
                    :selected="edgeLabelColor === opt.color"
                    :title="opt.chip || 'default'"
                    @click="onEdgeLabelColorChange?.(opt.color)"
                  />
                </div>
              </FlowToolbarItemWrapper>
            </div>
          </template>
        </UTabs>
      </template>
    </USlideover>
  </div>
</template>
