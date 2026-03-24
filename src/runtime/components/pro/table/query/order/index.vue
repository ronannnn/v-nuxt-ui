<script setup lang="ts" generic="T">
import type { OrderQuery, OrderQueryOpr, OrderQueryProps } from '../../../../../types'

const props = defineProps<OrderQueryProps<T>>()

const isOrderQueryDefault = computed(() => compareObjArrays(props.orderQuery, props.defaultOrderQuery))

const unselectedOrderFields = computed(() => {
  const selectedFields = props.orderQuery.map(query => query.field)
  return props.orderOptions.filter(option => !selectedFields.includes(option.field)).map(option => option.field as string)
})

const onUpdateAndTriggerFetching = async (newOrderQuery: OrderQuery<T>) => {
  props.onUpdateOrderQuery(newOrderQuery)
  await props.triggerFetching()
}

const onNewField = (field: string) => {
  onUpdateAndTriggerFetching([...props.orderQuery, { field, order: 'desc' }])
}
const onChangeField = (oldField: string, newField: string, opr: OrderQueryOpr) => {
  const oldIdx = props.orderQuery.findIndex(query => query.field === oldField)
  if (oldIdx !== -1) {
    onUpdateAndTriggerFetching(
      props.orderQuery.map((query, idx) => (idx === oldIdx ? { field: newField, order: opr } : query))
    )
  } else {
    onUpdateAndTriggerFetching([...props.orderQuery, { field: newField, order: opr }])
  }
}
const onRemoveField = (field: string) => {
  onUpdateAndTriggerFetching(props.orderQuery.filter(query => query.field !== field))
}

// drag related
const dragOrderQuery = computed<OrderQuery<T>>({
  get() {
    return props.orderQuery
  },
  set(newOrderQuery) {
    onUpdateAndTriggerFetching(newOrderQuery)
  }
})

const open = ref(false)
</script>

<template>
  <UPopover v-model:open="open" mode="click">
    <UChip :show="!isOrderQueryDefault">
      <UButton
        icon="i-lucide-arrow-up-down"
        :color="open ? 'primary' : 'neutral'"
        :loading="fetching"
        variant="outline"
        :size="size"
      >
        {{ $t('button.sort') }}
      </UButton>
    </UChip>
    <template #content>
      <div class="flex flex-col gap-2 p-2">
        <!-- items -->
        <ProDnd
          v-if="dragOrderQuery.length > 0"
          v-model="dragOrderQuery"
          handle=".order-query-handle"
          class="flex flex-col gap-2"
        >
          <ProTableQueryOrderItem
            v-for="item in dragOrderQuery"
            :key="item.field"
            :field="item.field as string"
            :biz-columns="bizColumns"
            :opr="item.order"
            :order-options="orderOptions"
            :unselected-fields="unselectedOrderFields"
            @change="(newField, orderType) => onChangeField(item.field as string, newField, orderType)"
            @remove="onRemoveField(item.field as string)"
          />
        </ProDnd>
        <div class="flex flex-col">
          <ProTableQueryOrderNewer
            :options="orderOptions"
            :unselected-fields="unselectedOrderFields"
            :biz-columns="bizColumns"
            @new="onNewField"
          />
          <UButton
            size="sm"
            color="neutral"
            variant="ghost"
            :disabled="isOrderQueryDefault || fetching"
            icon="i-lucide-timer-reset"
            @click="() => onUpdateAndTriggerFetching(defaultOrderQuery ?? [])"
          >
            重置
          </UButton>
        </div>
      </div>
    </template>
  </UPopover>
</template>
