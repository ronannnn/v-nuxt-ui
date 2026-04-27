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

const isWhereQueryEmpty = computed(() => {
  return !props.whereQuery || Object.keys(props.whereQuery ?? {}).length === 0
    || (
      // 仅检查有对应option的item的值是否为空
      (props.whereQuery?.items?.filter(query => props.whereOptions.find(option => option.field === query.field)).length ?? 0) === 0
      && (props.whereQuery?.groups?.length ?? 0) === 0
    )
})

const whereQueryWithoutInitValues = computed<WhereQueryItem<T>[]>(() => {
  if (!props.whereQuery) return []
  const defaultKeys = props.extraWhereQueryInitValues?.items?.map(query => query.field) ?? []
  return props.whereQuery.items?.filter((query) => {
    const field = query.field as string
    return !defaultKeys.includes(field)
  }) ?? []
})

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
  <div class="flex items-start gap-2 pl-4 pr-2.5 py-2.5">
    <!-- conditions -->
    <div class="flex flex-wrap items-center gap-2.5">
      <!-- key如果是field，那么field修改后，不能聚焦后面的组件，所以这里的key用idx代替 -->
      <template v-if="!isWhereQueryEmpty">
        <TableQueryWhereSimpleItem
          v-for="(item, idx) in whereQueryWithoutInitValues"
          :ref="(el) => setItemRef(item.field as string, el)"
          :key="idx"
          :where-query-item="item"
          :options="whereOptions"
          :fetching="fetching"
          :trigger-fetching="() => triggerFetching(true)"
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
      </template>
      <TableQueryWhereNewer
        :options="whereOptions"
        :unselected-fields="unselectedWhereFields"
        :biz-columns="bizColumns ?? []"
        size="sm"
        @new="onNewField"
      />
      <USeparator orientation="vertical" class="h-4" />
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
        icon="i-lucide-timer-reset"
        :disabled="fetching"
        @click="() => onUpdateWhereQuery(defaultWhereQuery)"
      >
        重置
      </UButton>
    </div>
  </div>
</template>
