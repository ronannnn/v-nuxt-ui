<script lang="ts">
export interface ConfirmDiffItem {
  label: string
  oldValue: string
  newValue: string
}
</script>

<script setup lang="ts">
defineProps<{
  diffItems: ConfirmDiffItem[]
}>()

const emit = defineEmits<{
  close: [boolean]
}>()
</script>

<template>
  <UModal
    title="确认修改"
    description="请确认以下修改内容，确认后将提交更新"
    :close="{ onClick: () => emit('close', false) }"
    :dismissible="false"
  >
    <template #body>
      <div class="overflow-auto max-h-96">
        <div class="space-y-3">
          <UFormField
            v-for="item in diffItems"
            :key="item.label"
            :label="item.label"
          >
            <div class="flex items-center gap-2">
              <span
                class="rounded-md bg-(--ui-bg-muted) px-2 py-1 text-sm text-(--ui-text-dimmed) line-through shrink-0 max-w-48 truncate"
                :title="item.oldValue"
              >
                {{ item.oldValue }}
              </span>
              <UIcon
                name="i-lucide-arrow-right"
                class="text-(--ui-text-dimmed) shrink-0 size-4"
              />
              <span
                class="rounded-md bg-(--ui-bg-primary-muted) px-2 py-1 text-sm text-(--ui-text-highlighted) font-medium shrink-0 max-w-48 truncate"
                :title="item.newValue"
              >
                {{ item.newValue }}
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
        label="确认修改"
        color="primary"
        variant="solid"
        icon="i-lucide-check"
        @click="emit('close', true)"
      />
    </template>
  </UModal>
</template>
