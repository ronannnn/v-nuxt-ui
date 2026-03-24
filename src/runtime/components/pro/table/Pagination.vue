<script setup lang="ts" generic="T">
import type { TablePaginationProps } from '../../../types'

withDefaults(defineProps<TablePaginationProps<T>>(), { size: 'sm' })

const isMobile = useApp().isMobile
</script>

<template>
  <div class="flex items-center justify-between gap-3 h-(--ui-footer-height) border-t border-default p-3">
    <div v-if="!isMobile" class="text-sm text-muted truncate">
      {{ selectedIds?.length ?? 0 }} of
      {{ data.length }} 行已选择
    </div>

    <div v-if="!hidePagination" class="flex items-center gap-1 ml-auto">
      <div v-if="!isMobile" class="text-sm text-muted truncate mr-3">
        共 {{ total }} 条
      </div>
      <UPagination
        :page="pageNum"
        :items-per-page="pageSize"
        :total="total"
        :size="size"
        variant="outline"
        active-variant="subtle"
        :disabled="fetching"
        :sibling-count="isMobile ? 1 : 2"
        @update:page="onUpdatePage"
      />
      <UDropdownMenu :disabled="fetching" :items="pageSizeDropdownMenuItems">
        <UButton
          :label="`${pageSize} / 页`"
          color="neutral"
          variant="outline"
          trailing-icon="i-lucide-chevron-down"
          :size="size"
        />
      </UDropdownMenu>
    </div>
  </div>
</template>
