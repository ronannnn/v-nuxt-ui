<script setup lang="ts" generic="T">
import type { ComponentPublicInstance } from 'vue'
import type { WhereQueryProps } from '#v/types'
import { computed, ref, nextTick, useTemplateRef } from 'vue'
import { useElementSize } from '@vueuse/core'
import { useTableWhereQuery } from '#v/composables'
import { useToast } from '@nuxt/ui/composables'
import UFieldGroup from '@nuxt/ui/components/FieldGroup.vue'
import UDropdownMenu from '@nuxt/ui/components/DropdownMenu.vue'
import Dnd from '#v/components/Dnd.client.vue'
import ScrollArea from '#v/components/ScrollArea.vue'
import TableQueryWhereSimpleItem from '#v/components/table/query/where/simple/item/index.vue'
import TableQueryWhereNewer from '#v/components/table/query/where/Newer.vue'
import ButtonConfirm from '#v/components/button/Confirm.vue'

const props = defineProps<WhereQueryProps<T> & {
  panelMaxHeight?: number
}>()

defineSlots<{
  'extra'?: () => any
  'inner-top'?: () => any
  'inner-bottom'?: () => any
}>()

const actionBarRef = useTemplateRef<HTMLElement>('actionBar')
const { height: actionBarHeight } = useElementSize(actionBarRef, undefined, { box: 'border-box' })
const panelStyle = computed(() =>
  props.panelMaxHeight ? { maxHeight: `${props.panelMaxHeight}px` } : undefined
)
const viewportStyle = computed(() => {
  if (!props.panelMaxHeight) return undefined
  return {
    maxHeight: `${Math.max(0, props.panelMaxHeight - actionBarHeight.value)}px`
  }
})

const {
  empty,
  isDateRangeQueryItem,
  isValidWhereField,
  moreActions,
  onClearValues,
  onDndEnd,
  onMoveItemSection,
  onNewField: createWhereQueryField,
  onRemoveFilter,
  onResetAll,
  onUpdateWhereQueryItem,
  sections,
  unselectedWhereFields
} = useTableWhereQuery(props)

const itemRefMap = ref<Map<string, { focus: () => void }>>(new Map())

function setItemRef(field: string, el: Element | ComponentPublicInstance | null) {
  if (el && 'focus' in el && typeof el.focus === 'function') {
    itemRefMap.value.set(field, el as { focus: () => void })
  } else {
    itemRefMap.value.delete(field)
  }
}

const onNewField = (field: string) => {
  if (!createWhereQueryField(field)) {
    useToast().add({
      title: '无法添加查询条件',
      description: `无法找到字段 ${field} 的选项，或该选项缺少类型信息`,
      color: 'warning'
    })
    return
  }
  nextTick(() => {
    const item = itemRefMap.value.get(field)
    if (item) {
      item.focus()
    }
  })
}

// 从列头筛选触发的聚焦
const focusField = (field: string): boolean => {
  if (!isValidWhereField(field)) {
    return false
  }
  const item = itemRefMap.value.get(field)
  if (item) {
    item.focus()
    return true
  }
  return false
}

const conditionListClass = 'grid grid-cols-24 gap-2.5'

defineExpose({ focusField })
</script>

<template>
  <div
    class="flex h-fit max-h-full flex-col divide-y divide-default overflow-hidden"
    :style="panelStyle"
  >
    <ScrollArea
      v-if="!empty || $slots['inner-top'] || $slots['inner-bottom']"
      class="!h-fit"
      viewport-class="!h-auto"
      :viewport-style="viewportStyle"
    >
      <div class="@container p-4 space-y-6">
        <div v-if="$slots['inner-top']">
          <slot name="inner-top" />
        </div>
        <template
          v-for="section in sections"
          :key="section.key"
        >
          <div v-if="section.dndItems.length > 0">
            <div class="font-bold text-xs text-dimmed mb-2.5">
              {{ section.label }}
            </div>
            <Dnd
              v-model="section.dndItems"
              group="where-query"
              handle=".where-query-handle"
              :on-end="onDndEnd"
              :class="conditionListClass"
            >
              <div
                v-for="item in section.dndItems"
                :key="item.field"
                class="col-span-24 @2xl:col-span-12 @4xl:col-span-8 @6xl:col-span-6 @7xl:col-span-4"
                :class="isDateRangeQueryItem(item) ? 'col-span-24 @2xl:col-span-12 @4xl:col-span-12 @6xl:col-span-8 @7xl:col-span-8' : undefined"
              >
                <TableQueryWhereSimpleItem
                  :ref="(el) => setItemRef(item.field as string, el)"
                  :where-query-item="item"
                  :options="whereOptions"
                  :fetching="fetching"
                  :trigger-fetching="() => triggerFetching(true)"
                  handle-class-name="where-query-handle"
                  :section="section.key"
                  @remove="onRemoveFilter"
                  @move-section="onMoveItemSection"
                  @update:where-query-item="newWhereQueryItem => onUpdateWhereQueryItem(item.field as string, newWhereQueryItem)"
                />
              </div>
            </Dnd>
          </div>
        </template>
        <div v-if="$slots['inner-bottom']">
          <slot name="inner-bottom" />
        </div>
      </div>
    </ScrollArea>
    <!-- action bar -->
    <div ref="actionBar" class="shrink-0 flex items-center gap-2.5 p-4">
      <div class="flex-1 hidden min-w-0 sm:flex">
        <slot name="extra" />
      </div>
      <div class="flex items-center gap-2.5">
        <UButton
          v-if="!hideQueryButton"
          label="查询"
          color="neutral"
          variant="subtle"
          size="sm"
          :loading="fetching"
          icon="i-lucide-search"
          @click="async () => {
            await triggerFetching(true)
          }"
        />
        <ButtonConfirm
          :button="{
            label: '清空',
            color: 'neutral',
            variant: 'outline',
            size: 'sm',
            icon: 'i-lucide-timer-reset'
          }"
          :confirm-button="{
            label: '确认',
            color: 'error',
            variant: 'outline',
            size: 'sm',
            icon: 'i-lucide-timer-reset'
          }"
          :complete-button="{
            label: '已清空',
            color: 'success',
            variant: 'outline',
            size: 'sm',
            icon: 'i-lucide-check'
          }"
          @confirm="onClearValues"
        >
          清空
        </ButtonConfirm>
        <TableQueryWhereNewer
          v-if="unselectedWhereFields.length > 0"
          :options="whereOptions"
          :unselected-fields="unselectedWhereFields"
          :biz-columns="bizColumns ?? []"
          size="sm"
          @new="onNewField"
        />
      </div>
      <div class="flex-1 flex justify-end items-center">
        <UFieldGroup size="sm">
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-timer-reset"
            :disabled="fetching"
            @click="onResetAll"
          >
            恢复默认条件
          </UButton>
          <UDropdownMenu :items="moreActions" size="sm">
            <UButton
              color="neutral"
              variant="outline"
              icon="i-lucide-ellipsis"
              :disabled="fetching"
            />
          </UDropdownMenu>
        </UFieldGroup>
      </div>
    </div>
  </div>
</template>
