<script setup lang="ts">
import type { TableColumn, Table } from '#v/types'
import { useTableColumnApi } from '#v/composables/api'
import { ref } from 'vue'
import { useToast } from '@nuxt/ui/composables'

const props = defineProps<{
  table: Table
  column?: {
    id: number
    columnKey: string
    label: string
    order: number
    width: number
    fixed: 'left' | 'right' | ''
    visible: boolean
  }
}>()

const emit = defineEmits<{
  close: [boolean]
  save: [Partial<TableColumn>]
}>()

const tableColumnApi = useTableColumnApi()
const saving = ref(false)

const formData = ref({
  columnKey: props.column?.columnKey ?? '',
  label: props.column?.label ?? '',
  order: props.column?.order ?? 0,
  width: props.column?.width ?? 100,
  fixed: props.column?.fixed ?? ('' as '' | 'left' | 'right'),
  visible: props.column?.visible ?? true
})

async function handleSave() {
  saving.value = true
  try {
    emit('save', {
      id: props.column?.id,
      columnKey: formData.value.columnKey,
      label: formData.value.label,
      order: formData.value.order,
      width: formData.value.width,
      fixed: formData.value.fixed,
      visible: formData.value.visible
    })
    emit('close', true)
  } catch (error) {
    useToast().add({
      title: '保存失败',
      description: String(error),
      color: 'error',
      icon: 'i-lucide-x-circle'
    })
    emit('close', false)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UModal
    :title="`编辑列 - ${column?.columnKey ?? ''}`"
    size="md"
    :close="{ onClick: () => emit('close', false) }"
  >
    <div class="p-4 space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-sm font-medium mb-1 block">列标识</label>
          <UInput v-model="formData.columnKey" placeholder="columnKey" />
        </div>
        <div>
          <label class="text-sm font-medium mb-1 block">显示名</label>
          <UInput v-model="formData.label" placeholder="显示名" />
        </div>
      </div>
      <div class="grid grid-cols-3 gap-4">
        <div>
          <label class="text-sm font-medium mb-1 block">顺序</label>
          <UInputNumber v-model="formData.order" :min="0" class="w-full" />
        </div>
        <div>
          <label class="text-sm font-medium mb-1 block">宽度</label>
          <UInputNumber v-model="formData.width" :min="0" class="w-full" />
        </div>
        <div>
          <label class="text-sm font-medium mb-1 block">固定</label>
          <USelect
            v-model="formData.fixed"
            :items="[
              { label: '不固定', value: '' },
              { label: '左侧', value: 'left' },
              { label: '右侧', value: 'right' }
            ]"
            class="w-full"
          />
        </div>
      </div>
      <div class="flex items-center gap-2">
        <USwitch v-model="formData.visible" />
        <span class="text-sm">{{ formData.visible ? '显示' : '隐藏' }}</span>
      </div>
    </div>
    <template #footer>
      <UButton
        label="取消"
        color="neutral"
        variant="subtle"
        @click="emit('close', false)"
      />
      <UButton
        label="保存"
        color="primary"
        variant="solid"
        :loading="saving"
        @click="handleSave"
      />
    </template>
  </UModal>
</template>
