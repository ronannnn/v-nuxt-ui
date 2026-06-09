<script setup lang="ts" generic="T">
import type { ComponentPublicInstance } from 'vue'
import type { WhereQueryItem, WhereQueryProps } from '#v/types'
import type { DropdownMenuItem } from '@nuxt/ui'
import { computed, ref, reactive, watch, nextTick } from 'vue'
import { useTableOpr } from '#v/composables/table/useTableOpr'
import { useToast } from '@nuxt/ui/composables'
import UFieldGroup from '@nuxt/ui/components/FieldGroup.vue'
import UDropdownMenu from '@nuxt/ui/components/DropdownMenu.vue'
import Dnd from '#v/components/Dnd.client.vue'
import TableQueryWhereSimpleItem from '#v/components/table/query/where/simple/item/index.vue'
import TableQueryWhereNewer from '#v/components/table/query/where/Newer.vue'

const props = defineProps<WhereQueryProps<T>>()

const selectedWhereFields = computed<string[]>(() => {
  return props.whereQuery?.items?.map(query => query.field as string) ?? []
})
const unselectedWhereFields = computed<string[]>(() => {
  return props.whereOptions.map(option => option.field as string).filter(field => !selectedWhereFields.value.includes(field))
})

const unselectedPreferredFields = computed<string[]>(() =>
  unselectedWhereFields.value.filter(field =>
    props.whereOptions.find(opt => opt.field === field)?.preferred !== false
  )
)
const unselectedOtherFields = computed<string[]>(() =>
  unselectedWhereFields.value.filter(field =>
    props.whereOptions.find(opt => opt.field === field)?.preferred === false
  )
)

// simple query: item ref map & helpers (merged from simple/index.vue)
const itemRefMap = ref<Map<string, { focus: () => void }>>(new Map())

function setItemRef(field: string, el: Element | ComponentPublicInstance | null) {
  if (el && 'focus' in el && typeof el.focus === 'function') {
    itemRefMap.value.set(field, el as { focus: () => void })
  }
}

const onRemoveFilter = (field: string) => {
  const updatedItems = props.whereQuery?.items?.filter(query => query.field !== field) ?? []
  props.onUpdateWhereQuery({
    ...props.whereQuery,
    items: updatedItems
  })
}

const onNewField = (field: string) => {
  const option = props.whereOptions.find(option => option.field === field)
  if (!option || !option.type) {
    useToast().add({
      title: '无法添加查询条件',
      description: `无法找到字段 ${field} 的选项，或该选项缺少类型信息`,
      color: 'warning'
    })
    return
  }
  props.onUpdateWhereQuery({
    ...props.whereQuery,
    items: [...(props.whereQuery?.items ?? []), {
      field,
      opr: option.defaultOpr ?? useTableOpr().getDefaultOprByType(option.type),
      value: null,
      custom: option.custom
    }]
  })
  nextTick(() => {
    const item = itemRefMap.value.get(field)
    if (item) {
      item.focus()
    }
  })
}

const getDefaultKeys = () => props.extraWhereQueryInitValues?.items?.map(query => query.field) ?? []

// 从列头筛选触发的聚焦
const whereQueryWithoutInitValues = computed<WhereQueryItem<T>[]>(() => {
  if (!props.whereQuery) return []
  const defaultKeys = getDefaultKeys()
  return props.whereQuery.items?.filter((query) => {
    const field = query.field as string
    return !defaultKeys.includes(field)
  }) ?? []
})

type WhereQuerySection = 'preferred' | 'other'
const whereQuerySectionExtraDataKey = '__whereQuerySection'

function getBaseItemSection(item: WhereQueryItem<T>): WhereQuerySection {
  return props.whereOptions.find(opt => opt.field === item.field)?.preferred === false ? 'other' : 'preferred'
}

function getItemSectionOverride(item: WhereQueryItem<T>): WhereQuerySection | undefined {
  if (!item.extraData || typeof item.extraData !== 'object' || Array.isArray(item.extraData)) return undefined
  const section = (item.extraData as Record<string, unknown>)[whereQuerySectionExtraDataKey]
  return section === 'preferred' || section === 'other' ? section : undefined
}

function getItemSection(item: WhereQueryItem<T>): WhereQuerySection {
  return getItemSectionOverride(item) ?? getBaseItemSection(item)
}

function isPreferredItem(item: WhereQueryItem<T>) {
  return getItemSection(item) === 'preferred'
}

function setItemSection(item: WhereQueryItem<T>, section: WhereQuerySection): WhereQueryItem<T> {
  const baseSection = getBaseItemSection(item)
  if (item.extraData && (typeof item.extraData !== 'object' || Array.isArray(item.extraData))) {
    return item
  }

  const extraData = item.extraData ? { ...item.extraData } : {}

  if (section === baseSection) {
    const { [whereQuerySectionExtraDataKey]: _section, ...restExtraData } = extraData as Record<string, unknown>
    return {
      ...item,
      extraData: Object.keys(restExtraData).length > 0 ? restExtraData : undefined
    }
  } else {
    ;(extraData as Record<string, unknown>)[whereQuerySectionExtraDataKey] = section
  }

  return {
    ...item,
    extraData: Object.keys(extraData).length > 0 ? extraData : undefined
  }
}

const preferredItems = computed<WhereQueryItem<T>[]>(() =>
  whereQueryWithoutInitValues.value.filter(isPreferredItem)
)

const otherItems = computed<WhereQueryItem<T>[]>(() =>
  whereQueryWithoutInitValues.value.filter(item => !isPreferredItem(item))
)

const preferredDndItems = ref<WhereQueryItem<T>[]>([])
const otherDndItems = ref<WhereQueryItem<T>[]>([])

watch([preferredItems, otherItems], () => {
  preferredDndItems.value = [...preferredItems.value]
  otherDndItems.value = [...otherItems.value]
}, { immediate: true })

function onDndEnd() {
  const defaultKeys = getDefaultKeys()
  const initItems = props.whereQuery?.items?.filter(q => defaultKeys.includes(q.field as string)) ?? []
  props.onUpdateWhereQuery({
    ...props.whereQuery,
    items: [
      ...initItems,
      ...preferredDndItems.value.map(item => setItemSection(item, 'preferred')),
      ...otherDndItems.value.map(item => setItemSection(item, 'other'))
    ]
  })
}

function onUpdateWhereQueryItem(field: string, newWhereQueryItem: WhereQueryItem<T>) {
  const items = props.whereQuery?.items ?? []
  const realIdx = items.findIndex(query => query.field === field)
  if (realIdx === -1) return
  const currentItem = items[realIdx]
  if (!currentItem) return
  const currentSection = getItemSection(currentItem)
  const updatedItems = [...items]
  updatedItems[realIdx] = setItemSection(newWhereQueryItem, currentSection)
  props.onUpdateWhereQuery({
    ...props.whereQuery,
    items: updatedItems
  })
}

const rangeOprList = ['range_gt_lt', 'range_gt_lte', 'range_gte_lt', 'range_gte_lte']
const isDateRangeQueryItem = (item: WhereQueryItem<T>) => {
  const option = props.whereOptions.find(option => option.field === item.field)
  return option?.type === 'date-picker' && rangeOprList.includes(item.opr as string)
}

// 清空数据：保留字段，值置空
const onClearValues = () => {
  if (!props.whereQuery?.items) return
  props.onUpdateWhereQuery({
    ...props.whereQuery,
    items: props.whereQuery.items.map(item => ({ ...item, value: null }))
  })
}

// 还原默认：补全 initHide 不为 true 的字段，值全部置空，不删除已有字段
const onResetAll = () => {
  const currentItems = props.whereQuery?.items ?? []
  const currentFields = new Set(currentItems.map(item => item.field as string))

  // 补全缺失的默认显示字段（initHide 不为 true）
  const missingOptions = props.whereOptions.filter(opt => !opt.initHide && !currentFields.has(opt.field as string))
  const newItems: WhereQueryItem<T>[] = missingOptions.map(opt => ({
    field: opt.field,
    opr: opt.defaultOpr ?? useTableOpr().getDefaultOprByType(opt.type),
    value: null,
    custom: opt.custom
  }))

  // 保留现有字段、值置空、追加缺失字段
  props.onUpdateWhereQuery({
    ...props.whereQuery,
    items: [
      ...currentItems.map(item => ({ ...item, value: null })),
      ...newItems
    ]
  })
}

// 补全字段：将可查询但未出现的字段追加到列表后面（常用优先）
const onFillMissingFields = () => {
  const currentFields = new Set((props.whereQuery?.items ?? []).map(item => item.field as string))
  const missingOptions = props.whereOptions.filter(opt => !currentFields.has(opt.field as string))
  if (missingOptions.length === 0) return

  const preferred = missingOptions.filter(opt => opt.preferred !== false)
  const other = missingOptions.filter(opt => opt.preferred === false)

  const newItems: WhereQueryItem<T>[] = [...preferred, ...other].map(opt => ({
    field: opt.field,
    opr: opt.defaultOpr ?? useTableOpr().getDefaultOprByType(opt.type),
    value: null,
    custom: opt.custom
  }))

  props.onUpdateWhereQuery({
    ...props.whereQuery,
    items: [...(props.whereQuery?.items ?? []), ...newItems]
  })
}

// 删除所有字段：仅保留 init 值
const onRemoveAllFields = () => {
  const defaultKeys = props.extraWhereQueryInitValues?.items?.map(q => q.field) ?? []
  const initItems = props.whereQuery?.items?.filter(q => defaultKeys.includes(q.field as string)) ?? []
  props.onUpdateWhereQuery({
    ...props.whereQuery,
    items: initItems.map(item => ({ ...item, value: null }))
  })
}

const moreActions = computed<DropdownMenuItem[]>(() => [
  { label: '补全全部字段', icon: 'i-lucide-list-plus', onSelect: onFillMissingFields },
  { label: '清空全部字段', icon: 'i-lucide-trash-2', onSelect: onRemoveAllFields }
])

// 从列头筛选触发的聚焦
const focusField = (field: string): boolean => {
  const item = itemRefMap.value.get(field)
  if (item) {
    item.focus()
    return true
  }
  return false
}

const conditionListClass = 'grid grid-cols-24 gap-3'

const sections = reactive([
  { key: 'preferred' as const, label: '常用条件', dndItems: preferredDndItems, unselectedFields: unselectedPreferredFields },
  { key: 'other' as const, label: '其他条件', dndItems: otherDndItems, unselectedFields: unselectedOtherFields }
])

defineExpose({ focusField })
</script>

<template>
  <div class="divide-y divide-default">
    <div class="@container p-2.5 space-y-4">
      <div
        v-for="section in sections"
        :key="section.key"
      >
        <div class="font-bold text-xs text-dimmed mb-1.5">
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
            class="flex items-center gap-1 col-span-24 @3xl:col-span-12 @5xl:col-span-8 @7xl:col-span-6"
            :class="isDateRangeQueryItem(item) ? '@3xl:col-span-24 @5xl:col-span-12 @7xl:col-span-8' : undefined"
          >
            <TableQueryWhereSimpleItem
              :ref="(el) => setItemRef(item.field as string, el)"
              :where-query-item="item"
              :options="whereOptions"
              :fetching="fetching"
              :trigger-fetching="() => triggerFetching(true)"
              handle-class-name="where-query-handle"
              @remove="onRemoveFilter"
              @update:where-query-item="newWhereQueryItem => onUpdateWhereQueryItem(item.field as string, newWhereQueryItem)"
            />
          </div>
          <div class="col-span-24 @3xl:col-span-12 @5xl:col-span-8 @7xl:col-span-6">
            <TableQueryWhereNewer
              v-if="unselectedWhereFields.length > 0"
              :options="whereOptions"
              :unselected-fields="unselectedWhereFields"
              :biz-columns="bizColumns ?? []"
              size="sm"
              @new="onNewField"
            />
          </div>
        </Dnd>
      </div>
    </div>
    <!-- action bar -->
    <div class="flex items-center gap-2.5 p-2.5">
      <div class="flex-1" />
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
        <UButton
          color="neutral"
          variant="subtle"
          size="sm"
          icon="i-lucide-eraser"
          :disabled="fetching"
          @click="onClearValues"
        >
          清空值
        </UButton>
      </div>
      <div class="flex-1 flex justify-end items-center">
        <UFieldGroup size="sm">
          <UButton
            color="neutral"
            variant="subtle"
            icon="i-lucide-timer-reset"
            :disabled="fetching"
            @click="onResetAll"
          >
            恢复默认条件
          </UButton>
          <UDropdownMenu :items="moreActions" size="sm">
            <UButton
              color="neutral"
              variant="subtle"
              icon="i-lucide-ellipsis"
              :disabled="fetching"
            />
          </UDropdownMenu>
        </UFieldGroup>
      </div>
    </div>
  </div>
</template>
