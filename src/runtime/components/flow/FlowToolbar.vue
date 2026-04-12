<script setup lang="ts">
import ButtonTheme from '#v/components/button/Theme.vue'
import { FLOW_EDGE_STROKE_TYPES, FLOW_EDGE_PATH_TYPES, FLOW_EDGE_COLORS } from '#v/constants'
import type { FlowEdgeStrokeType, FlowEdgePathType } from '#v/constants'

defineProps<{
  onAddNode?: () => void
  edgeStrokeWidth?: number
  edgeStrokeType?: FlowEdgeStrokeType
  edgePathType?: FlowEdgePathType
  edgeMarkerStart?: boolean
  edgeMarkerEnd?: boolean
  edgeAnimated?: boolean
  edgeColor?: string
  nodeBorderWidth?: number
  onEdgeStrokeWidthChange?: (width: number) => void
  onEdgeStrokeTypeChange?: (type: FlowEdgeStrokeType) => void
  onEdgePathTypeChange?: (type: FlowEdgePathType) => void
  onToggleEdgeMarkerStart?: () => void
  onToggleEdgeMarkerEnd?: () => void
  onToggleEdgeAnimated?: () => void
  onEdgeColorChange?: (color: string) => void
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
            <ButtonTheme
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
            </ButtonTheme>
          </div>
        </fieldset>

        <fieldset>
          <legend class="text-[11px] leading-none font-semibold mb-2">
            连接线类型
          </legend>

          <div class="grid grid-cols-4 gap-2 -mx-2">
            <ButtonTheme
              v-for="opt in FLOW_EDGE_STROKE_TYPES"
              :key="opt.type"
              :label="opt.label"
              :selected="edgeStrokeType === opt.type"
              class="justify-center min-w-10"
              @click="onEdgeStrokeTypeChange?.(opt.type)"
            >
              <template #leading>
                <svg width="20" height="10" class="text-current">
                  <line
                    x1="0" y1="5" x2="20" y2="5"
                    stroke="currentColor"
                    stroke-width="2"
                    :stroke-dasharray="opt.dasharray || 'none'"
                  />
                </svg>
              </template>
            </ButtonTheme>
          </div>
        </fieldset>

        <fieldset>
          <legend class="text-[11px] leading-none font-semibold mb-2">
            连接线路径
          </legend>

          <div class="grid grid-cols-4 gap-2 -mx-2">
            <ButtonTheme
              v-for="opt in FLOW_EDGE_PATH_TYPES"
              :key="opt.type"
              :label="opt.label"
              :selected="edgePathType === opt.type"
              class="justify-center min-w-10"
              @click="onEdgePathTypeChange?.(opt.type)"
            >
              <template #leading>
                <svg v-if="opt.type === 'smoothstep'" width="20" height="14" class="text-current">
                  <path d="M 0 12 L 6 12 Q 10 12 10 7 Q 10 2 14 2 L 20 2" fill="none" stroke="currentColor" stroke-width="2" />
                </svg>
                <svg v-else-if="opt.type === 'bezier'" width="20" height="14" class="text-current">
                  <path d="M 0 12 C 10 12, 10 2, 20 2" fill="none" stroke="currentColor" stroke-width="2" />
                </svg>
                <svg v-else-if="opt.type === 'step'" width="20" height="14" class="text-current">
                  <path d="M 0 12 L 10 12 L 10 2 L 20 2" fill="none" stroke="currentColor" stroke-width="2" />
                </svg>
                <svg v-else-if="opt.type === 'straight'" width="20" height="14" class="text-current">
                  <line x1="0" y1="12" x2="20" y2="2" stroke="currentColor" stroke-width="2" />
                </svg>
              </template>
            </ButtonTheme>
          </div>
        </fieldset>

        <fieldset>
          <legend class="text-[11px] leading-none font-semibold mb-2">
            连接线箭头
          </legend>

          <div class="grid grid-cols-2 gap-2 -mx-2">
            <ButtonTheme
              label="起点"
              :icon="edgeMarkerStart ? 'i-lucide-arrow-left' : 'i-lucide-minus'"
              :selected="edgeMarkerStart"
              @click="onToggleEdgeMarkerStart?.()"
            />
            <ButtonTheme
              label="终点"
              :icon="edgeMarkerEnd ? 'i-lucide-arrow-right' : 'i-lucide-minus'"
              :selected="edgeMarkerEnd"
              @click="onToggleEdgeMarkerEnd?.()"
            />
          </div>
        </fieldset>

        <fieldset>
          <legend class="text-[11px] leading-none font-semibold mb-2">
            连接线动画
          </legend>

          <div class="grid grid-cols-2 gap-2 -mx-2">
            <ButtonTheme
              label="流动"
              icon="i-lucide-activity"
              :selected="edgeAnimated"
              @click="onToggleEdgeAnimated?.()"
            />
          </div>
        </fieldset>

        <fieldset>
          <legend class="text-[11px] leading-none font-semibold mb-2">
            连接线颜色
          </legend>

          <div class="flex gap-2 -mx-2 px-2">
            <button
              v-for="opt in FLOW_EDGE_COLORS"
              :key="opt.color"
              class="w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center"
              :class="edgeColor === opt.color ? 'border-primary ring-2 ring-primary/30 scale-110' : 'border-default hover:scale-105'"
              :style="opt.color ? { backgroundColor: opt.color } : {}"
              :title="opt.label"
              @click="onEdgeColorChange?.(opt.color)"
            >
              <span v-if="!opt.color" class="text-[10px] text-muted">A</span>
            </button>
          </div>
        </fieldset>

        <fieldset>
          <legend class="text-[11px] leading-none font-semibold mb-2">
            节点边框粗细
          </legend>

          <div class="grid grid-cols-5 gap-2 -mx-2">
            <ButtonTheme
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
            </ButtonTheme>
          </div>
        </fieldset>
      </template>
    </UPopover>
  </div>
</template>
