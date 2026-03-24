<script setup lang="ts" generic="T">
import type { VColumn } from '../../../../../types'

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
    description="配置表格列的显示与顺序"
    inset
    :close="{ onClick: () => emit('close', false) }"
  >
    <template #body>
      <ProTableHeaderSettingsColumns
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
