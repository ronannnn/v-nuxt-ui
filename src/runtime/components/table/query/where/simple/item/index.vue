<script setup lang="ts" generic="T">
import type { WhereQueryOption, WhereQueryItem } from '#v/types'
import { computed, watch, useTemplateRef } from 'vue'
import TableQueryWhereSimpleItemOprPicker from '#v/components/table/query/where/simple/item/OprPicker.vue'
import TableQueryWhereSimpleItemOpr from '#v/components/table/query/where/simple/item/opr/index.vue'
import ButtonConfirm from '#v/components/button/Confirm.vue'
import { tableWhereQueryItemIconMap } from '#v/constants'

const props = defineProps<{
  options: WhereQueryOption<T>[]
  fetching?: boolean
  triggerFetching?: () => Promise<void>
  onRemove: (field: string) => void
  handleClassName?: string
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
  <div class="w-full flex flex-col group/where-item">
    <div class="flex items-center rounded-t-md bg-elevated/40 border border-b-0 border-accented">
      <!-- <TableQueryWhereSimpleItemColumnPicker
        v-model:where-query-item="whereQueryItem"
        :options="options"
        :fetching="fetching"
        disabled
        class="!bg-elevated/40"
        :focus="() => oprRef?.focus()"
      /> -->
      <div class="flex-1 flex items-center gap-1 pl-2.5">
        <UIcon :name="tableWhereQueryItemIconMap.get(option?.type ?? 'unknown') || 'field'" class="size-3.5 text-highlighted" />
        <span class="text-xs font-bold text-highlighted">
          {{ option?.label ?? whereQueryItem.field }}
        </span>
      </div>
      <ButtonConfirm
        class="rounded-b-none rounded-tl-none bg-elevated/40 opacity-0 transition-all group-hover/where-item:opacity-100 max-md:opacity-100"
        @confirm="onRemove(whereQueryItem.field as string)"
      />
    </div>
    <UFieldGroup size="sm" class="w-full">
      <TableQueryWhereSimpleItemOprPicker
        v-model:where-query-item="whereQueryItem"
        :options="options"
        :fetching="fetching"
        :focus="() => oprRef?.focus()"
        :disabled="option?.disableOprSelector"
        button-class="rounded-t-none bg-default text-muted font-normal"
      />
      <TableQueryWhereSimpleItemOpr
        ref="opr"
        v-model:where-query-item="whereQueryItem"
        :options="options"
        :fetching="fetching"
        :trigger-fetching="triggerFetching"
        class="w-full"
      />
      <UButton
        variant="outline"
        icon="i-lucide-grip-vertical"
        color="neutral"
        class="cursor-move hover:bg-default active:bg-default rounded-t-none"
        :class="handleClassName"
        aria-label="拖拽查询条件"
      />
    </UFieldGroup>
  </div>
</template>
