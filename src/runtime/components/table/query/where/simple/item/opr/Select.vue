<script setup lang="ts" generic="T">
import type { SelectOption, WhereQueryItem } from '../../../../../../../types'
import type { CommandPaletteGroup } from '@nuxt/ui'
import { computed, useTemplateRef } from 'vue'

const props = defineProps<{
  disabled?: boolean
  items: SelectOption[]
}>()

const whereQueryItem = defineModel<WhereQueryItem<T>>('whereQueryItem', { required: true })

const queryValue = computed<(string | number)[] | null>({
  get() {
    return whereQueryItem.value.value
  },
  set(newValue) {
    whereQueryItem.value = { ...whereQueryItem.value, value: newValue }
  }
})

const groups = computed<CommandPaletteGroup[]>(() => [
  {
    id: 'fields',
    items: props.items,
    ignoreFilter: true
  }
])

const ref = useTemplateRef('dropdownBtn')
defineExpose({
  focus: () => {
    ref.value?.focus()
  }
})
</script>

<template>
  <ProButtonDropdown
    ref="dropdownBtn"
    v-model="queryValue"
    :groups="groups"
    multiple
    enable-footer-toolbar
  >
    <UButton
      size="sm"
      color="neutral"
      variant="outline"
    >
      <div v-if="!queryValue || queryValue.length === 0">
        --
      </div>
      <div v-else-if="queryValue.length <= 2" class="flex items-center gap-1">
        {{ queryValue.map(value => items.find(item => item.value === value)?.label || value).join(', ') }}
      </div>
      <div v-else>
        <!-- 打印前两项，后面+1代替 -->
        <div class="flex items-center gap-1">
          <div v-for="value in queryValue.slice(0, 2)" :key="value">
            {{ items.find(item => item.value === value)?.label || value }}
          </div>
          <span>+{{ queryValue.length - 2 }}</span>
        </div>
      </div>
    </UButton>
  </ProButtonDropdown>
</template>
