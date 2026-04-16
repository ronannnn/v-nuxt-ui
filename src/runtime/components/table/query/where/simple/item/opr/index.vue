<script setup lang="ts" generic="T">
import type { WhereQueryOption, WhereQueryItem } from '#v/types'
import { computed, watch, useTemplateRef } from 'vue'
import TableQueryWhereSimpleItemOprInput from '#v/components/table/query/where/simple/item/opr/Input.vue'
import TableQueryWhereSimpleItemOprInputNumber from '#v/components/table/query/where/simple/item/opr/InputNumber.vue'
import TableQueryWhereSimpleItemOprSelect from '#v/components/table/query/where/simple/item/opr/Select.vue'
import TableQueryWhereSimpleItemOprDatePicker from '#v/components/table/query/where/simple/item/opr/DatePicker.vue'
import TableQueryWhereSimpleItemOprAsyncSelect from '#v/components/table/query/where/simple/item/opr/AsyncSelect.vue'

const props = defineProps<{
  options: WhereQueryOption<T>[]
  fetching?: boolean
  triggerFetching?: () => Promise<void>
}>()
const whereQueryItem = defineModel<WhereQueryItem<T>>('whereQueryItem', { required: true })

const option = computed<WhereQueryOption<T>>(() =>
  props.options.find(option => option.field === whereQueryItem.value.field)
  ?? { type: 'unknown', field: 'unknown', label: '未知字段' })

watch(
  () => whereQueryItem.value.custom,
  () => {
    whereQueryItem.value = { ...whereQueryItem.value, custom: option.value?.custom }
  },
  { immediate: true }
)

const itemRef = useTemplateRef('item')
defineExpose({
  focus: () => itemRef.value?.focus()
})
</script>

<template>
  <TableQueryWhereSimpleItemOprInput
    v-if="option!.type === 'input'"
    ref="item"
    v-model:where-query-item="whereQueryItem"
    :label="option.label || whereQueryItem.field"
    :disabled="fetching"
    :trigger-fetching="triggerFetching"
  />
  <TableQueryWhereSimpleItemOprInputNumber
    v-else-if="option.type === 'input-number'"
    ref="item"
    v-model:where-query-item="whereQueryItem"
    :label="option.label || whereQueryItem.field"
    :disabled="fetching"
    :trigger-fetching="triggerFetching"
  />
  <TableQueryWhereSimpleItemOprSelect
    v-else-if="option!.type === 'select'"
    ref="item"
    v-model:where-query-item="whereQueryItem"
    :disabled="fetching"
    :items="option.items || []"
    :placeholder="option.placeholder"
  />
  <TableQueryWhereSimpleItemOprDatePicker
    v-else-if="option!.type === 'date-picker'"
    ref="item"
    v-model:where-query-item="whereQueryItem"
    :disabled="fetching"
  />
  <TableQueryWhereSimpleItemOprAsyncSelect
    v-else-if="option!.type === 'async-select'"
    ref="item"
    v-model:where-query-item="whereQueryItem"
    :disabled="fetching"
    :trigger-fetching="triggerFetching"
    :label="option.label!"
    :list-api="option.listApi!"
    :search-fields="option.searchFields"
    :label-render-fn="option.labelRenderFn"
    :label-field="option.labelField"
    :value-field="option.valueField"
    :multiple="option.multiple"
    :placeholder="option.placeholder"
  />
</template>
