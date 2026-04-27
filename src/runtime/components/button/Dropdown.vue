<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ListboxItem, ListboxProps } from '@nuxt/ui'

const props = defineProps<{
  items: ListboxItem[]
  multiple?: ListboxProps['multiple']
  onOpen?: () => Promise<void>
  onSearch?: (searchTerm: string) => Promise<void>
}>()

const modelValue = defineModel<string | number | undefined | (string | number)[]>('modelValue', { required: false })

// search
const searchTerm = ref('')

const popoverOpen = ref(false)
watch(popoverOpen, async (newOpen) => {
  if (newOpen) {
    await props.onOpen?.()
  } else {
    searchTerm.value = ''
  }
})

defineExpose({
  focus: async () => {
    popoverOpen.value = true
  }
})
</script>

<template>
  <!-- NOTE: 自己实现DropdownMenu, 原生DropdownMenu的Focus有问题，会让查询字段打开的Popover关闭 -->
  <UPopover
    v-model:open="popoverOpen"
    :content="{
      align: 'start',
      onCloseAutoFocus: e => e.preventDefault()
    }"
  >
    <slot />

    <template #content>
      <UListbox
        v-model="modelValue"
        v-model:search-term="searchTerm"
        autofocus
        size="sm"
        value-key="id"
        :filter="{
          placeholder: '搜索...',
          icon: 'i-lucide-search'
        }"
        :ui="{
          root: 'ring-0'
        }"
        :items="props.items"
        :multiple="props.multiple"
      />
    </template>
  </UPopover>
</template>
