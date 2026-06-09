<script setup lang="ts" generic="T">
import type { VColumn } from '#v/types'
import TableHeaderSettingsColumns from '#v/components/table/header/settings/columns/index.vue'

defineProps<{
  tblName: string
  rawBizColumns: VColumn<T>[]
  onUpdateBizColumns: (cols: VColumn<T>[]) => void
}>()

const emit = defineEmits<{
  close: [boolean]
}>()
</script>

<template>
  <USlideover
    :title="`${tblName}设置`"
    description="通过拖拽调整顺序，使用右侧按钮固定或隐藏列"
    inset
    :close="{ onClick: () => emit('close', false) }"
  >
    <template #body>
      <TableHeaderSettingsColumns
        :raw-biz-columns="rawBizColumns"
        :tbl-name="tblName"
        @update-biz-columns="onUpdateBizColumns"
      />
    </template>
    <template #footer>
      <UButton
        label="关闭"
        color="neutral"
        variant="subtle"
        icon="i-lucide-x"
        @click="emit('close', false)"
      />
    </template>
  </USlideover>
</template>
