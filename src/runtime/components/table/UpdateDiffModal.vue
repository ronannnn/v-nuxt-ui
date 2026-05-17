<script setup lang="ts">
import { ref, computed } from 'vue'
import type { RowRecord, VColumn } from '#v/types'
import type { TimelineItem } from '@nuxt/ui'
import { isEmptyString } from '#v/utils'
import { diffWords } from 'diff'
import { useRowRecordApi } from '#v/composables/api'
import { useDate } from '#v/composables'

const props = defineProps<{
  tableName: string
  rowId: number
  columns: VColumn<any>[]
  title?: string
}>()

const emit = defineEmits<{
  close: [boolean]
}>()

const date = useDate()
const rowRecordApi = useRowRecordApi()
const loading = ref(false)
const rowRecords = ref<RowRecord[]>([])

async function fetchRowRecords() {
  loading.value = true
  try {
    const { data } = await rowRecordApi.getByTableNameAndRowId({
      tableName: props.tableName,
      rowId: props.rowId
    })
    rowRecords.value = data.value.data?.list ?? []
  } finally {
    loading.value = false
  }
}
fetchRowRecords()

function resolveHeader(key: string): string {
  if (!key) return ''
  const col = props.columns.find(c => (c as any).accessorKey === key || c.id === key)
  return (col?.header as string) || key
}

interface ChangeWithDisplay {
  header: string
  oldValue: string
  newValue: string
  parts: ReturnType<typeof diffWords>
}

interface AggregatedRecord {
  rowVersion: number
  createdAt?: string
  creator?: any
  changes: ChangeWithDisplay[]
}

const aggregatedRecords = computed<AggregatedRecord[]>(() => {
  if (!rowRecords.value.length) return []

  const groupMap = new Map<number, AggregatedRecord>()
  for (const record of rowRecords.value) {
    const ver = record.rowVersion!
    if (!groupMap.has(ver)) {
      groupMap.set(ver, {
        rowVersion: ver,
        createdAt: record.createdAt,
        creator: record.creator,
        changes: []
      })
    }
    const oldVal = record.oldValue || ''
    const newVal = record.newValue || ''
    groupMap.get(ver)!.changes.push({
      header: resolveHeader(record.key || ''),
      oldValue: oldVal,
      newValue: newVal,
      parts: diffWords(oldVal, newVal)
    })
  }

  return Array.from(groupMap.values()).sort((a, b) => b.rowVersion - a.rowVersion)
})

const timelineItems = computed<TimelineItem[]>(() =>
  aggregatedRecords.value.map(record => ({
    record,
    icon: 'i-lucide-git-commit'
  }))
)
</script>

<template>
  <UModal
    :title="title || '变更记录'"
    :close="{ onClick: () => emit('close', false) }"
    :dismissible="false"
    :ui="{ body: 'p-0!' }"
  >
    <template #body>
      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-8">
        <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin text-dimmed" />
      </div>

      <!-- Timeline -->
      <div v-else-if="timelineItems.length > 0" class="overflow-y-auto max-h-96 p-6">
        <UTimeline
          :items="timelineItems"
          size="xs"
          :ui="{ date: 'float-end' }"
        >
          <template #title="{ item }">
            <div class="flex items-center gap-1">
              <span class="font-semibold">{{ item.record.creator?.nickname || '未知用户' }}</span>
              <UBadge
                :label="`v${item.record.rowVersion}`"
                variant="subtle"
                color="neutral"
                size="xs"
              />
              <div class="ml-auto text-xs text-dimmed font-normal">
                更新于 {{ date.formatTimeUnit(date.isoUtcStringToDateValue(item.record.createdAt), 'time') }}
              </div>
            </div>
          </template>

          <template #description="{ item }">
            <div class="rounded-md ring ring-default mt-2 p-3 space-y-3">
              <div v-for="(change, idx) in item.record.changes" :key="idx">
                <div class="text-xs font-semibold text-dimmed mb-1">
                  {{ change.header }}
                </div>
                <div class="flex items-center flex-wrap gap-2">
                  <!-- Old -->
                  <span class="rounded-md bg-muted px-2 py-1 text-sm text-dimmed">
                    <span v-if="change.parts.filter((part: any) => !part.added).length === 0">{{ '\xa0' }}</span>
                    <template v-for="(part, pIdx) in change.parts" :key="pIdx">
                      <span
                        v-if="!part.added"
                        :class="{ 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200 rounded-sm line-through px-0.5': part.removed }"
                      >
                        {{ isEmptyString(part.value) ? '\xa0' : part.value }}
                      </span>
                    </template>
                  </span>
                  <UIcon name="i-lucide-arrow-right" class="text-dimmed shrink-0 size-4" />
                  <!-- New -->
                  <span class="rounded-md bg-elevated px-2 py-1 text-sm text-highlighted font-medium">
                    <span v-if="change.parts.filter((part: any) => !part.removed).length === 0">{{ '\xa0' }}</span>
                    <template v-for="(part, pIdx) in change.parts" :key="pIdx">
                      <span
                        v-if="!part.removed"
                        :class="{ 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200 rounded-sm px-0.5': part.added }"
                      >
                        {{ isEmptyString(part.value) ? '\xa0' : part.value }}
                      </span>
                    </template>
                  </span>
                </div>
              </div>
            </div>
          </template>
        </UTimeline>
      </div>

      <!-- Empty -->
      <div v-else class="text-center text-dimmed py-8">
        暂无变更记录
      </div>
    </template>
    <template #footer>
      <UButton
        label="关闭"
        color="neutral"
        variant="subtle"
        @click="emit('close', false)"
      />
    </template>
  </UModal>
</template>
