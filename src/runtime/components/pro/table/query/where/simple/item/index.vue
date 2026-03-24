<script setup lang="ts">
import type { WhereQueryOption, WhereQueryItem } from '../../../../../../../types'

const props = defineProps<{
  options: WhereQueryOption<any>[]
  fetching?: boolean
  triggerFetching?: () => Promise<void>
  onRemove: (field: string) => void
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

const oprRef = useTemplateRef('opr')
defineExpose({
  focus: () => oprRef.value?.focus()
})
</script>

<template>
  <UFieldGroup size="sm">
    <ProTableQueryWhereSimpleItemColumnPicker
      v-model:where-query-item="whereQueryItem"
      :options="options"
      :fetching="fetching"
      :focus="() => oprRef?.focus()"
    />
    <ProTableQueryWhereSimpleItemOprPicker
      v-model:where-query-item="whereQueryItem"
      :options="options"
      :fetching="fetching"
      :focus="() => oprRef?.focus()"
      :disabled="option?.disableOprSelector"
    />
    <ProTableQueryWhereSimpleItemOpr
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
