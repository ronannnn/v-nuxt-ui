<script setup lang="ts" generic="T">
import type { WhereQueryOption, WhereQueryItem } from '#v/types'
import { computed, watch, useTemplateRef } from 'vue'
import TableQueryWhereSimpleItemColumnPicker from '#v/components/table/query/where/simple/item/ColumnPicker.vue'
import TableQueryWhereSimpleItemOprPicker from '#v/components/table/query/where/simple/item/OprPicker.vue'
import TableQueryWhereSimpleItemOpr from '#v/components/table/query/where/simple/item/opr/index.vue'

const props = defineProps<{
  options: WhereQueryOption<T>[]
  fetching?: boolean
  triggerFetching?: () => Promise<void>
  onRemove: (field: string) => void
}>()
const whereQueryItem = defineModel<WhereQueryItem<T>>('whereQueryItem', { required: true })

const option = computed(() => props.options.find(option => option.field === whereQueryItem.value.field))

watch(
  () => option.value?.custom,
  (newCustom) => {
    if (whereQueryItem.value.custom === newCustom) return
    whereQueryItem.value = { ...whereQueryItem.value, custom: newCustom }
  },
  { immediate: true }
)

const oprRef = useTemplateRef('opr')
defineExpose({
  focus: () => oprRef.value?.focus()
})
</script>

<template>
  <UFieldGroup size="sm">
    <TableQueryWhereSimpleItemColumnPicker
      v-model:where-query-item="whereQueryItem"
      :options="options"
      :fetching="fetching"
      :focus="() => oprRef?.focus()"
    />
    <TableQueryWhereSimpleItemOprPicker
      v-model:where-query-item="whereQueryItem"
      :options="options"
      :fetching="fetching"
      :focus="() => oprRef?.focus()"
      :disabled="option?.disableOprSelector"
    />
    <TableQueryWhereSimpleItemOpr
      ref="opr"
      v-model:where-query-item="whereQueryItem"
      :options="options"
      :fetching="fetching"
      :trigger-fetching="triggerFetching"
    />
    <UButton
      color="neutral"
      variant="outline"
      icon="i-lucide-x"
      @click="onRemove(whereQueryItem.field as string)"
    />
  </UFieldGroup>
</template>
