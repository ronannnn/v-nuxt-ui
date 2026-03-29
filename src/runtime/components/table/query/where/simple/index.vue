<script setup lang="ts">
import type { ProTableQueryWhereSimpleItem } from '#components'
import type { WhereSimpleQueryProps } from '../../../../../types'
import { ref } from 'vue'

const props = defineProps<WhereSimpleQueryProps<any>>()

const onRemoveFilter = (field: string) => {
  props.onUpdateItems(props.items?.filter(query => query.field !== field) ?? [])
}

const itemRefMap = ref<Map<string, InstanceType<typeof ProTableQueryWhereSimpleItem>>>(new Map())
defineExpose({
  focusItem: (field: string): boolean => {
    const item = itemRefMap.value.get(field)
    if (item) {
      item.focus()
      return true
    }
    return false
  }
})
</script>

<template>
  <div class="flex flex-wrap gap-2.5">
    <!-- key如果是field，那么field修改后，不能聚焦后面的组件，所以这里的key用idx代替 -->
    <ProTableQueryWhereSimpleItem
      v-for="(item, idx) in items"
      :ref="(el) => itemRefMap.set(item.field as string, el as any)"
      :key="idx"
      :where-query-item="item"
      :options="whereOptions"
      :fetching="fetching"
      :trigger-fetching="() => triggerFetching(true)"
      @remove="onRemoveFilter"
      @update:where-query-item="newWhereQueryItem => {
        const updatedItems = [...props.items ?? []]
        updatedItems[idx] = newWhereQueryItem
        props.onUpdateItems(updatedItems)
      }"
    />
  </div>
</template>
