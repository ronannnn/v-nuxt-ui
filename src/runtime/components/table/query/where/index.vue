<script setup lang="ts" generic="T">
import type { WhereQueryProps } from '../../../../types'
import { computed, useTemplateRef, nextTick } from 'vue'
import { useNuxtApp } from '#imports'
import { useTableOpr } from '#v/composables/table/useTableOpr'

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
    useNuxtApp().$warningToast(`未找到查询字段 ${field} 对应的WhereQueryOption`)
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
    <div class="flex flex-wrap gap-2.5">
      <ProTableQueryWhereSimple
        v-if="!isWhereQueryEmpty"
        v-bind="props"
        ref="simpleWhereQuery"
        :items="whereQuery?.items"
        @update-items="newItems => onUpdateWhereQuery({
          ...whereQuery,
          items: newItems
        })"
      />
      <ProTableQueryWhereNewer
        :options="whereOptions"
        :unselected-fields="unselectedWhereFields"
        :biz-columns="bizColumns ?? []"
        size="sm"
        @new="onNewField"
      />
      <UButton
        v-if="!hideQueryButton"
        color="neutral"
        variant="soft"
        size="sm"
        :loading="fetching"
        icon="i-lucide-search"
        @click="async () => {
          await triggerFetching(true)
        }"
      />
    </div>

    <!-- buttons -->
    <div class="flex gap-2.5 items-center ml-auto shrink-0">
      <USeparator orientation="vertical" class="h-6" />
      <UButton
        color="neutral"
        variant="outline"
        size="sm"
        :disabled="fetching"
        @click="() => onUpdateWhereQuery(defaultWhereQuery)"
      >
        重置
      </UButton>
    </div>
  </div>
</template>
