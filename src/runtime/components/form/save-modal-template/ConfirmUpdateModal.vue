<script setup lang="ts">
import type { VFormFieldProps } from '#v/types'
import { isEmptyString } from '#v/utils'
import { diffEligibleTypes, useConfirmDiff } from '#v/composables'

export interface ConfirmDiffItem {
  fieldName: string
  oldValue: unknown
  newValue: unknown
}

const props = defineProps<{
  fields: VFormFieldProps[]
  diffItems: ConfirmDiffItem[]
  oldModelValue: Record<string, unknown>
  newModelValue: Record<string, unknown>
}>()

const emit = defineEmits<{
  close: [boolean]
}>()

const { diffedItems } = useConfirmDiff(
  () => props.fields,
  () => props.diffItems,
  () => props.oldModelValue,
  () => props.newModelValue
)
</script>

<template>
  <UModal
    title="确认修改"
    :close="{ onClick: () => emit('close', false) }"
    :dismissible="false"
  >
    <template #description>
      <div class="flex items-center gap-3 w-full">
        <span>
          请确认以下 {{ diffedItems.length }} 处修改内容
        </span>
      </div>
    </template>
    <template #body>
      <div class="overflow-y-auto max-h-96">
        <div class="space-y-4">
          <UFormField
            v-for="item in diffedItems"
            :key="item.fieldName"
            :label="item.field!.label || item.fieldName"
          >
            <!-- String types: word diff -->
            <div v-if="item.field!.diffable ?? diffEligibleTypes.has(item.field!.type)" class="flex items-center flex-wrap gap-2">
              <span
                class="rounded-md bg-muted px-2 py-1 text-sm text-dimmed"
                :title="item.oldDisplay"
              >
                <span v-if="!item.parts.filter((part: any) => !part.added).length">{{ '\xa0' }}</span>
                <template v-for="(part, idx) in item.parts" :key="idx">
                  <span
                    v-if="!part.added"
                    :class="{ 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200 rounded-sm line-through px-0.5': part.removed }"
                  >{{ isEmptyString(part.value) ? '\xa0' : part.value }}</span>
                </template>
              </span>
              <UIcon
                name="i-lucide-arrow-right"
                class="text-dimmed shrink-0 size-4"
              />
              <span
                class="rounded-md bg-elevated px-2 py-1 text-sm text-highlighted font-bold"
                :title="item.newDisplay"
              >
                <span v-if="!item.parts.filter((part: any) => !part.removed).length">{{ '\xa0' }}</span>
                <template v-for="(part, idx) in item.parts" :key="idx">
                  <span
                    v-if="!part.removed"
                    :class="{ 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200 rounded-sm px-0.5': part.added }"
                  >{{ isEmptyString(part.value) ? '\xa0' : part.value }}</span>
                </template>
              </span>
            </div>
            <!-- Other types: simple old -> new -->
            <div v-else class="flex items-center flex-wrap gap-2">
              <span
                class="rounded-md bg-muted px-2 py-1 text-sm text-dimmed"
                :title="item.oldDisplay"
              >
                {{ isEmptyString(item.oldDisplay) ? '\xa0' : item.oldDisplay }}
              </span>
              <UIcon
                name="i-lucide-arrow-right"
                class="text-dimmed shrink-0 size-4"
              />
              <span
                class="rounded-md bg-elevated px-2 py-1 text-sm text-highlighted font-medium"
                :title="item.newDisplay"
              >
                {{ isEmptyString(item.newDisplay) ? '\xa0' : item.newDisplay }}
              </span>
            </div>
          </UFormField>
        </div>
      </div>
    </template>
    <template #footer>
      <UButton
        label="取消"
        color="neutral"
        variant="subtle"
        icon="i-lucide-x"
        @click="emit('close', false)"
      />
      <UButton
        :label="`确认 ${diffedItems.length} 处修改`"
        color="primary"
        variant="solid"
        icon="i-lucide-check"
        @click="emit('close', true)"
      />
    </template>
  </UModal>
</template>
