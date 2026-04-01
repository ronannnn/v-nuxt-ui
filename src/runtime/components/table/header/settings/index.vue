<script setup lang="ts">
import type { VColumn } from '#v/types'
import TableHeaderSettingsColumns from '#v/components/table/header/settings/columns/index.vue'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>

defineProps<{
  tblName: string
  rawBizColumns: VColumn<AnyRecord>[]
  onUpdateBizColumns: (cols: VColumn<AnyRecord>[]) => void
}>()

const emit = defineEmits<{
  close: [boolean]
}>()
</script>

<template>
  <USlideover
    :title="`${tblName}设置`"
    description="配置表格列的显示与顺序"
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
        label="取消"
        color="neutral"
        variant="subtle"
        icon="i-lucide-x"
        @click="emit('close', false)"
      />
    </template>
  </USlideover>
</template>
