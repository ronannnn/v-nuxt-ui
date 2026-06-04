<script setup lang="ts" generic="T">
import type { ComponentPublicInstance } from 'vue'
import type { WhereQueryItem, WhereQueryProps } from '#v/types'
import { computed, ref, nextTick } from 'vue'
import { useTableOpr } from '#v/composables/table/useTableOpr'
import { useToast } from '@nuxt/ui/composables'
import TableQueryWhereSimpleItem from '#v/components/table/query/where/simple/item/index.vue'
import TableQueryWhereNewer from '#v/components/table/query/where/Newer.vue'

const props = defineProps<WhereQueryProps<T>>()

const selectedWhereFields = computed<string[]>(() => {
  return props.whereQuery?.items?.map(query => query.field as string) ?? []
})
const unselectedWhereFields = computed<string[]>(() => {
  return props.whereOptions.map(option => option.field as string).filter(field => !selectedWhereFields.value.includes(field))
})

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

// 从列头筛选触发的聚焦
const whereQueryWithoutInitValues = computed<WhereQueryItem<T>[]>(() => {
  if (!props.whereQuery) return []
  const defaultKeys = props.extraWhereQueryInitValues?.items?.map(query => query.field) ?? []
  return props.whereQuery.items?.filter((query) => {
    const field = query.field as string
    return !defaultKeys.includes(field)
  }) ?? []
})

const preferredItems = computed<WhereQueryItem<T>[]>(() =>
  whereQueryWithoutInitValues.value.filter(item =>
    props.whereOptions.find(opt => opt.field === item.field)?.preferred ?? true
  )
)

const otherItems = computed<WhereQueryItem<T>[]>(() =>
  whereQueryWithoutInitValues.value.filter(item =>
    !(props.whereOptions.find(opt => opt.field === item.field)?.preferred ?? true)
  )
)

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

// 重置：清空数据 + 重置为默认字段
const onResetAll = () => {
  props.onUpdateWhereQuery(props.defaultWhereQuery)
}

// 从列头筛选触发的聚焦
const focusField = (field: string): boolean => {
  const item = itemRefMap.value.get(field)
  if (item) {
    item.focus()
    return true
  }
  return false
}
defineExpose({ focusField })
</script>

<template>
  <div class="divide-y divide-default">
    <div class="@container p-2.5 space-y-2.5">
      <!-- preferred conditions -->
      <div v-if="unselectedWhereFields.length > 0 || preferredItems.length > 0">
        <div class="font-bold text-xs text-dimmed mb-1">
          常用条件
        </div>
        <div class="grid grid-flow-dense grid-cols-1 @2xl:grid-cols-2 @3xl:grid-cols-3 @4xl:grid-cols-4 gap-2.5">
          <TableQueryWhereSimpleItem
            v-for="(item, idx) in preferredItems"
            :ref="(el) => setItemRef(item.field as string, el)"
            :key="idx"
            :where-query-item="item"
            :options="whereOptions"
            :fetching="fetching"
            :trigger-fetching="() => triggerFetching(true)"
            :class="isDateRangeQueryItem(item) ? '@2xl:col-span-2' : undefined"
            @remove="onRemoveFilter"
            @update:where-query-item="newWhereQueryItem => {
              const items = props.whereQuery?.items ?? []
              const realIdx = items.findIndex(q => q.field === item.field)
              if (realIdx === -1) return
              const updatedItems = [...items]
              updatedItems[realIdx] = newWhereQueryItem
              onUpdateWhereQuery({
                ...whereQuery,
                items: updatedItems
              })
            }"
          />
          <TableQueryWhereNewer
            v-if="unselectedWhereFields.length > 0"
            :options="whereOptions"
            :unselected-fields="unselectedWhereFields"
            :biz-columns="bizColumns ?? []"
            size="sm"
            @new="onNewField"
          />
        </div>
      </div>

      <!-- other conditions -->
      <div v-if="unselectedWhereFields.length > 0 || otherItems.length > 0">
        <div class="font-bold text-xs text-dimmed mb-1">
          其他条件
        </div>
        <div class="grid grid-flow-dense grid-cols-1 @2xl:grid-cols-2 @3xl:grid-cols-3 @4xl:grid-cols-4 gap-2.5">
          <TableQueryWhereSimpleItem
            v-for="(item, idx) in otherItems"
            :ref="(el) => setItemRef(item.field as string, el)"
            :key="idx"
            :where-query-item="item"
            :options="whereOptions"
            :fetching="fetching"
            :trigger-fetching="() => triggerFetching(true)"
            :class="isDateRangeQueryItem(item) ? '@2xl:col-span-2' : undefined"
            @remove="onRemoveFilter"
            @update:where-query-item="newWhereQueryItem => {
              const items = props.whereQuery?.items ?? []
              const realIdx = items.findIndex(q => q.field === item.field)
              if (realIdx === -1) return
              const updatedItems = [...items]
              updatedItems[realIdx] = newWhereQueryItem
              onUpdateWhereQuery({
                ...whereQuery,
                items: updatedItems
              })
            }"
          />
          <TableQueryWhereNewer
            v-if="unselectedWhereFields.length > 0"
            :options="whereOptions"
            :unselected-fields="unselectedWhereFields"
            :biz-columns="bizColumns ?? []"
            size="sm"
            @new="onNewField"
          />
        </div>
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
          清空
        </UButton>
      </div>
      <div class="flex-1 flex justify-end">
        <UButton
          color="neutral"
          variant="subtle"
          size="sm"
          icon="i-lucide-timer-reset"
          :disabled="fetching"
          @click="onResetAll"
        >
          重置
        </UButton>
      </div>
    </div>
  </div>
</template>
