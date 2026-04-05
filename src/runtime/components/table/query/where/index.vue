<script setup lang="ts" generic="T extends Record<string, any>">
import type { WhereQueryProps } from '#v/types'
import { computed, useTemplateRef, nextTick } from 'vue'
import { useTableOpr } from '#v/composables/table/useTableOpr'
import { useToast } from '@nuxt/ui/composables'
import TableQueryWhereSimple from '#v/components/table/query/where/simple/index.vue'
import TableQueryWhereNewer from '#v/components/table/query/where/Newer.vue'

const props = defineProps<WhereQueryProps<T>>()

const selectedWhereFields = computed<string[]>(() => {
  return props.whereQuery?.items?.map(query => query.field as string) ?? []
})
const unselectedWhereFields = computed<string[]>(() => {
  return props.whereOptions.map(option => option.field as string).filter(field => !selectedWhereFields.value.includes(field))
})

const simpleWhereQueryRef = useTemplateRef('simpleWhereQuery')
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
    simpleWhereQueryRef.value?.focusItem(field)
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

// 从列头筛选触发的聚焦
const focusField = (field: string): boolean => {
  return simpleWhereQueryRef.value?.focusItem(field) ?? false
}
defineExpose({ focusField })
</script>

<template>
  <div class="flex items-start gap-2 pl-4 pr-2.5 py-2.5">
    <!-- conditions -->
    <div class="flex flex-wrap items-center gap-2.5">
      <TableQueryWhereSimple
        v-if="!isWhereQueryEmpty"
        v-bind="props"
        ref="simpleWhereQuery"
        :items="whereQuery?.items"
        @update-items="newItems => onUpdateWhereQuery({
          ...whereQuery,
          items: newItems
        })"
      />
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
