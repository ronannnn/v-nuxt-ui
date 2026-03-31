<script setup lang="ts" generic="T">
import type { TableColumn } from '@nuxt/ui'
import type { FixType } from './index.vue'
import type { DndProps } from '#v/types'
import ScrollArea from '#v/components/ScrollArea.vue'
import Dnd from '#v/components/Dnd.client.vue'
import TableHeaderSettingsColumnsItem from '#v/components/table/header/settings/columns/Item.vue'

defineProps<{
  name: string
  rawBizColumns: TableColumn<T>[]
  group: DndProps<T>['group']
  handle: DndProps<T>['handle']
  onFixCol: (col: LocalStorage.Column, fixType: FixType) => void
  onAfterDrag?: () => void
}>()
const list = defineModel<LocalStorage.Column[]>('list', { required: true })
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex items-center gap-1">
      <span class="text-sm font-semibold text-dimmed">{{ name }}</span>
      <span class="text-sm text-dimmed">{{ list.length }}</span>
    </div>
    <ScrollArea
      class="min-w-48 border border-dashed border-default rounded-md p-2"
      enable-bottom-transparent
      enable-top-transparent
    >
      <Dnd
        v-model="list"
        :group="group"
        :handle="handle"
        class="flex flex-col gap-2 h-fit"
        :class="list.length === 0 ? 'min-h-10.5': ''"
        @after-drag="onAfterDrag"
      >
        <TableHeaderSettingsColumnsItem
          v-for="element in list"
          :key="element.accessorKey"
          v-model:checked="element.checked"
          :stg-col="element"
          :columns="rawBizColumns"
          @fix-col="onFixCol"
        />
      </Dnd>
    </ScrollArea>
  </div>
</template>
