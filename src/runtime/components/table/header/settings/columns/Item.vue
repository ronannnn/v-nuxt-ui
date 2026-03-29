<script setup lang="ts">
import type { FixType } from './index.vue'
import type { VColumn } from '../../../../../types'

defineProps<{
  columns: VColumn<any>[]
  stgCol: LocalStorage.Column
  onFixCol: (col: LocalStorage.Column, fixType: FixType) => void
}>()
const checked = defineModel<boolean | undefined>('checked', { required: true })
</script>

<template>
  <div
    v-if="stgCol.accessorKey"
    class="flex items-center border border-default bg-default rounded-md p-2 group transition-colors"
    :class="!(checked ?? true) && 'text-neutral-400 dark:text-neutral-500'"
  >
    <UIcon name="i-lucide-grip-vertical" class="col-settings-handle cursor-move flex-center" />
    <span class="text-sm font-semibold ml-2 mr-12">
      {{ columns.find(col => (col as any)['accessorKey'] === stgCol.accessorKey)?.header ?? '未知列名' }}
    </span>
    <div class="ml-auto flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
      <UTooltip v-if="stgCol.fixed !== 'left'" :content="{ side: 'top' }" text="固定列到左侧">
        <UButton
          icon="i-lucide-chevron-left"
          variant="ghost"
          size="xs"
          color="neutral"
          @click="() => onFixCol(stgCol, 'left')"
        />
      </UTooltip>
      <UTooltip v-if="stgCol.fixed !== 'right'" :content="{ side: 'top' }" text="固定列到右侧">
        <UButton
          icon="i-lucide-chevron-right"
          variant="ghost"
          size="xs"
          color="neutral"
          @click="() => onFixCol(stgCol, 'right')"
        />
      </UTooltip>
      <UTooltip v-if="stgCol.fixed !== 'unfixed'" :content="{ side: 'top' }" text="取消固定">
        <UButton
          icon="i-lucide-x"
          variant="ghost"
          size="xs"
          color="neutral"
          @click="() => onFixCol(stgCol, 'unfixed')"
        />
      </UTooltip>
      <UTooltip :text="(checked ?? true) ? '隐藏该列' : '显示该列'" :content="{ side: 'top' }">
        <UButton
          :icon="(checked ?? true) ? 'i-lucide-eye' : 'i-lucide-eye-off'"
          variant="ghost"
          size="xs"
          color="neutral"
          @click="checked = !checked"
        />
      </UTooltip>
    </div>
  </div>
</template>
