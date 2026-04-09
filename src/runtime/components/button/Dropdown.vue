<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { SelectOption } from '#v/types'
import type { CommandPaletteGroup, CommandPaletteItem, CommandPaletteProps } from '@nuxt/ui'

const props = defineProps<{
  groups: CommandPaletteGroup[]
  multiple?: CommandPaletteProps['multiple']
  enableFooterToolbar?: boolean
  onOpen?: () => Promise<void>
  onSearch?: (searchTerm: string) => Promise<void>
}>()

const modelValue = defineModel<string | number | undefined | null | (string | number)[]>('modelValue', { required: false })
const commandPaletteModelValue = computed({
  get() {
    if (props.multiple) {
      const values: CommandPaletteItem[] = []
      for (const group of props.groups) {
        for (const item of group.items!) {
          if (Array.isArray(modelValue.value) && modelValue.value.includes(item.value)) {
            values.push(item)
          }
        }
      }
      return values
    }
    for (const group of props.groups) {
      for (const item of group.items!) {
        if (item.value === modelValue.value) {
          const newItem = { ...item }
          delete newItem.onSelect // TODO: 不知道为什么有onSelect就不会显示checked icon
          return newItem
        }
      }
    }
    return {}
  },
  set(newValue) {
    if (props.multiple) {
      modelValue.value = (newValue as SelectOption[]).map(item => item.value)
    } else {
      modelValue.value = (newValue as SelectOption).value
    }
  }
})

const footerActions = [
  {
    label: '全选',
    fn: () => modelValue.value = props.groups.flatMap(group => group.items!.map(item => item.value))
  },
  {
    label: '反选',
    fn: () => modelValue.value = props.groups
      .flatMap(group => group.items!.map(item => item.value))
      .filter(value => !(Array.isArray(modelValue.value) ? modelValue.value.includes(value) : modelValue.value === value))
  },
  {
    label: '清空',
    fn: () => modelValue.value = []
  }
]

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
      <UCommandPalette
        :model-value="commandPaletteModelValue"
        :selection-behavior="multiple ? 'toggle': 'replace'"
        :groups="groups"
        size="sm"
        :multiple="multiple"
        :ui="{
          input: '[&>input]:h-7',
          itemLeadingIcon: 'size-3 self-center'
        }"
        placeholder="搜索"
        :search-term="searchTerm"
        @update:model-value="newValue => {
          commandPaletteModelValue = newValue as any
          if (!multiple) {
            popoverOpen = false
          }
        }"
        @update:search-term="async newSearchTerm => {
          searchTerm = newSearchTerm
          await onSearch?.(newSearchTerm)
        }"
      >
        <template v-if="enableFooterToolbar && multiple" #footer>
          <div class="flex">
            <UFieldGroup class="flex items-center ml-auto">
              <UButton
                v-for="action in footerActions"
                :key="action.label"
                :label="action.label"
                size="xs"
                color="neutral"
                variant="ghost"
                class="text-muted font-normal"
                @click="action.fn"
              />
            </UFieldGroup>
          </div>
        </template>
      </UCommandPalette>
    </template>
  </UPopover>
</template>
