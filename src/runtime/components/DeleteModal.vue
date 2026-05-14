<script setup lang="ts">
import { computed } from 'vue'
import { useSubmitting } from '#v/composables/useBoolean'
import type { RequestResult } from '#v/types'
import type { Ref } from 'vue'

const props = withDefaults(defineProps<{
  ids?: number[]
  models?: any[]
  displayFn?: ((model: any) => string | undefined)
  onDelete?: ((ids: number[]) => Promise<{ data: Ref<RequestResult<any>> }> | undefined)
}>(), {
  ids: () => [],
  models: () => []
})

const emit = defineEmits<{
  close: [boolean]
}>()

const effectiveIds = computed<number[]>(() => {
  if (props.models && props.models.length > 0) {
    return props.models.map(m => m.id as number)
  }
  return props.ids ?? []
})

const displayLabels = computed<string[]>(() => {
  if (props.models && props.models.length > 0) {
    if (props.displayFn) {
      return props.models.map(m => props.displayFn!(m) ?? String(m.id))
    }
    return props.models.map(m => String(m.id))
  }
  return (props.ids ?? []).map(id => String(id))
})

const { submitting, startSubmitting, endSubmitting } = useSubmitting()
async function onSubmit(e: MouseEvent) {
  if (!props.onDelete) return
  e.preventDefault()
  try {
    startSubmitting()
    const { data } = await props.onDelete(effectiveIds.value)!
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
    <template #body>
      <div v-if="effectiveIds.length > 0" class="mb-4">
        <p class="text-sm text-(--ui-text-muted) mb-2">
          以下数据将被删除：
        </p>
        <ul class="list-disc list-inside space-y-1">
          <li
            v-for="(label, index) in displayLabels"
            :key="effectiveIds[index]"
            class="text-sm"
          >
            {{ label }}
          </li>
        </ul>
      </div>
      <slot />
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton
          label="取消"
          color="neutral"
          variant="subtle"
          @click="emit('close', false)"
        />
        <UButton
          :label="`删除 ${effectiveIds.length} 条数据`"
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
