<script setup lang="ts" generic="T">
import { useSubmitting } from '#v/composables/useBoolean'
import type { RequestResult } from '#v/types'
import type { Ref } from 'vue'

const props = defineProps<{
  ids: number[]
  onDelete: ((ids: number[]) => Promise<{ data: Ref<RequestResult<T>> }> | undefined) | undefined | null
}>()
const emit = defineEmits<{
  close: [boolean]
}>()

const { submitting, startSubmitting, endSubmitting } = useSubmitting()
async function onSubmit(e: MouseEvent) {
  if (!props.onDelete) return
  e.preventDefault()
  try {
    startSubmitting()
    const { data } = await props.onDelete(props.ids)!
    if (!data.value.error) {
      emit('close', true)
    }
  } finally {
    endSubmitting()
  }
}
</script>

<template>
  <UModal
    title="请确认是否删除已选数据"
    description="删除后数据将无法恢复，请谨慎操作"
    :close="{ onClick: () => emit('close', false) }"
    :dismissible="false"
  >
    <UButton
      color="error"
      variant="soft"
      icon="i-lucide-trash-2"
    >
      删除
    </UButton>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton
          label="取消"
          color="neutral"
          variant="subtle"
          @click="emit('close', false)"
        />
        <UButton
          :label="`删除 ${props.ids.length} 条数据`"
          color="error"
          variant="solid"
          icon="i-lucide-trash"
          :loading="submitting"
          @click="onSubmit"
        />
      </div>
    </template>
  </UModal>
</template>
