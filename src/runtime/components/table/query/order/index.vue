<script setup lang="ts" generic="T">
import type { OrderQueryProps, OrderQuery, OrderQueryOpr } from '#v/types'
import { compareObjArrays } from '#v/utils'
import { computed } from 'vue'
import Dnd from '#v/components/Dnd.client.vue'
import TableQueryOrderItem from '#v/components/table/query/order/item.vue'
import TableQueryOrderNewer from '#v/components/table/query/order/Newer.vue'

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

const createOrderQueryItem = (field: string, order: OrderQueryOpr = 'desc') => {
  const option = props.orderOptions.find(option => option.field === field)
  return { field, order, custom: option?.custom }
}

const onNewField = (field: string) => {
  onUpdateAndTriggerFetching([...props.orderQuery, createOrderQueryItem(field)])
}
const onChangeField = (oldField: string, newField: string, opr: OrderQueryOpr) => {
  const oldIdx = props.orderQuery.findIndex(query => query.field === oldField)
  if (oldIdx !== -1) {
    onUpdateAndTriggerFetching(
      props.orderQuery.map((query, idx) => (idx === oldIdx ? createOrderQueryItem(newField, opr) : query))
    )
  } else {
    onUpdateAndTriggerFetching([...props.orderQuery, createOrderQueryItem(newField, opr)])
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
</script>

<template>
  <div class="flex flex-col p-4 gap-2.5">
    <div class="font-bold text-xs text-dimmed">
      排序条件
    </div>
    <Dnd
      v-if="dragOrderQuery.length > 0"
      v-model="dragOrderQuery"
      handle=".order-query-handle"
      class="flex flex-col gap-2.5"
    >
      <TableQueryOrderItem
        v-for="item in dragOrderQuery"
        :key="item.field"
        :field="item.field as string"
        :biz-columns="bizColumns"
        :opr="item.order"
        :order-options="orderOptions"
        :unselected-fields="unselectedOrderFields"
        :disabled="fetching"
        handle-class-name="order-query-handle"
        @change="(newField, orderType) => onChangeField(item.field as string, newField, orderType)"
        @remove="onRemoveField(item.field as string)"
      />
    </Dnd>
    <div class="flex flex-col">
      <TableQueryOrderNewer
        :options="orderOptions"
        :unselected-fields="unselectedOrderFields"
        :biz-columns="bizColumns"
        :disabled="fetching"
        @new="onNewField"
      />
      <UButton
        size="sm"
        color="neutral"
        variant="ghost"
        square
        :disabled="isOrderQueryDefault || fetching"
        icon="i-lucide-timer-reset"
        @click="() => onUpdateAndTriggerFetching(defaultOrderQuery ?? [])"
      >
        重置
      </UButton>
    </div>
  </div>
</template>
