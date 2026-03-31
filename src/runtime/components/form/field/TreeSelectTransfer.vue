<script setup lang="ts">
import { ref, watch } from 'vue'
import type { VFormFieldTreeSelectTransferProps } from '#v/types'
import { flattenTree } from '#v/utils'
import type { TreeItem } from '@nuxt/ui'
import ScrollArea from '#v/components/ScrollArea.vue'

const props = defineProps<VFormFieldTreeSelectTransferProps>()

// 两个tree公用同一个expand，以保持展开状态一致
// target中的key肯定和source中的key一致
const expandedTreeItems = ref<string[]>()

watch(() => props.sourceTreeItems, () => {
  expandedTreeItems.value = flattenTree(props.sourceTreeItems).map(item => item.value ?? '')
})

// 获取某个节点的所有祖先节点
function getAncestors(items: TreeItem[], targetValue: string, ancestors: TreeItem[] = []): TreeItem[] {
  for (const item of items) {
    if (item.value === targetValue) {
      return ancestors
    }
    if (item.children) {
      const found = getAncestors(item.children, targetValue, [...ancestors, item])
      if (found.length > 0 || item.children.some(child => child.value === targetValue)) {
        if (item.children.some(child => child.value === targetValue)) {
          return [...ancestors, item]
        }
        return found
      }
    }
  }
  return []
}

// 处理选中状态更新，确保父节点也被选中
function handleUpdateModelValue(selectedItems: TreeItem[]) {
  const selectedValues = new Set(selectedItems.map(item => item.value ?? ''))
  const allParents = new Set<string>()

  // 对每个选中的节点，找到其所有祖先节点
  for (const item of selectedItems) {
    const ancestors = getAncestors(props.sourceTreeItems, item.value ?? '')
    ancestors.forEach((ancestor) => {
      if (ancestor.value) {
        allParents.add(ancestor.value)
      }
    })
  }

  // 从扁平化的树中获取所有需要选中的节点（包括父节点）
  const allTreeItems = flattenTree(props.sourceTreeItems)
  const finalSelectedItems = allTreeItems.filter(item =>
    selectedValues.has(item.value ?? '') || allParents.has(item.value ?? '')
  )

  props.onUpdateTargetTreeItems(finalSelectedItems)
}
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-px min-h-8">
    <ScrollArea class="sm:rounded-none sm:rounded-l-md ring ring-accented px-2 py-1">
      <UTree
        v-model:expanded="expandedTreeItems"
        :model-value="flattenTree(targetTreeItems)"
        :items="sourceTreeItems"
        :get-key="i => i.value"
        :as="{ link: 'div' }"
        size="sm"
        multiple
        propagate-select
        class="max-h-64 w-full"
        @update:model-value="handleUpdateModelValue"
      >
        <template #item-leading="{ selected, indeterminate, handleSelect }">
          <UCheckbox
            :model-value="indeterminate ? 'indeterminate' : selected"
            tabindex="-1"
            size="sm"
            @change="handleSelect"
            @click.stop
          />
        </template>
      </UTree>
    </ScrollArea>
    <ScrollArea class="sm:rounded-none sm:rounded-r-md ring ring-accented px-2 py-1">
      <div class="flex items-center gap-2">
        <UTree
          v-model:expanded="expandedTreeItems"
          :items="targetTreeItems"
          :get-key="i => i.value"
          size="sm"
          class="max-h-64 w-full"
        />
      </div>
    </ScrollArea>
  </div>
</template>
