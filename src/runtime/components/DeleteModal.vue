<script setup lang="ts">
import { useSubmitting } from '#v/composables/useBoolean'

const props = defineProps<{
  ids: number[]
  onDelete: (ids: number[]) => Promise<any>
}>()

const emit = defineEmits<{
  close: [ok: boolean]
}>()

const { submitting, startSubmitting, endSubmitting } = useSubmitting()

async function handleDelete() {
  try {
    startSubmitting()
    const { data } = await props.onDelete(props.ids)
    if (data?.value && !data.value.error) {
      emit('close', true)
    }
  } finally {
    endSubmitting()
  }
}
</script>

<template>
  <UModal :open="true" @update:open="emit('close', false)">
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-triangle-alert" class="text-error size-5" />
        <span>Confirm Delete</span>
      </div>
    </template>

    <template #body>
      <p>
        Are you sure you want to delete {{ ids.length }} {{ ids.length === 1 ? 'item' : 'items' }}?
        This action cannot be undone.
      </p>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton
          color="neutral"
          variant="outline"
          label="Cancel"
          @click="emit('close', false)"
        />
        <UButton
          color="error"
          label="Delete"
          :loading="submitting"
          @click="handleDelete"
        />
      </div>
    </template>
  </UModal>
</template>
