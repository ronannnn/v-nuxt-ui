<script setup lang="ts" generic="T extends Record<string, any>">
import type { ComponentPublicInstance } from 'vue'
import type { WhereSimpleQueryProps } from '#v/types'
import { ref } from 'vue'
import TableQueryWhereSimpleItem from '#v/components/table/query/where/simple/item/index.vue'

const props = defineProps<WhereSimpleQueryProps<T>>()

const onRemoveFilter = (field: string) => {
  props.onUpdateItems(props.items?.filter(query => query.field !== field) ?? [])
}

const itemRefMap = ref<Map<string, { focus: () => void }>>(new Map())

function setItemRef(field: string, el: Element | ComponentPublicInstance | null) {
  if (el && 'focus' in el && typeof el.focus === 'function') {
    itemRefMap.value.set(field, el as { focus: () => void })
  }
}

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
    <TableQueryWhereSimpleItem
      v-for="(item, idx) in items"
      :ref="(el) => setItemRef(item.field as string, el)"
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
