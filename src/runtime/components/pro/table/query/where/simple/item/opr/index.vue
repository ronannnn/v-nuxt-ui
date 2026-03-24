<script setup lang="ts">
import type { WhereQueryOption, WhereQueryItem } from '../../../../../../../../types'

const props = defineProps<{
  options: WhereQueryOption<any>[]
  fetching?: boolean
  triggerFetching?: () => Promise<void>
}>()
const whereQueryItem = defineModel<WhereQueryItem<any>>('whereQueryItem', { required: true })

const option = computed(() => props.options.find(option => option.field === whereQueryItem.value.field))

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
  <ProTableQueryWhereSimpleItemOprInput
    v-if="option!.type === 'input'"
    ref="item"
    v-model:where-query-item="whereQueryItem"
    :label="option?.label || whereQueryItem.field"
    :disabled="fetching"
    :trigger-fetching="triggerFetching"
  />
  <ProTableQueryWhereSimpleItemOprInputNumber
    v-if="option!.type === 'input-number'"
    ref="item"
    v-model:where-query-item="whereQueryItem"
    :label="option?.label || whereQueryItem.field"
    :disabled="fetching"
    :trigger-fetching="triggerFetching"
  />
  <ProTableQueryWhereSimpleItemOprSelect
    v-else-if="option!.type === 'select'"
    ref="item"
    v-model:where-query-item="whereQueryItem"
    :disabled="fetching"
    :items="option?.items || []"
  />
  <ProTableQueryWhereSimpleItemOprDatePicker
    v-else-if="option!.type === 'date-picker'"
    ref="item"
    v-model:where-query-item="whereQueryItem"
    :disabled="fetching"
  />
  <ProTableQueryWhereSimpleItemOprAsyncSelect
    v-else-if="option!.type === 'async-select'"
    ref="item"
    v-model:where-query-item="whereQueryItem"
    :disabled="fetching"
    :trigger-fetching="triggerFetching"
    :label="option?.label!"
    :list-api="option?.listApi!"
    :search-fields="option?.searchFields ?? []"
    :label-render-fn="option?.labelRenderFn"
    :label-field="option?.labelField"
    :value-field="option?.valueField"
    :multiple="option?.multiple"
  />
</template>
