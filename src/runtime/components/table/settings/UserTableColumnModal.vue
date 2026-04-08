<script setup lang="ts">
import type { MergedTableColumn, UserTableColumn } from '#v/types'
import { ref, watch } from 'vue'
import { useAuth } from '#v/composables'

const { loginUser } = useAuth()

const props = defineProps<{
  column: MergedTableColumn
  open: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:open': [boolean]
  close: []
  save: [UserTableColumn]
}>()

const openModel = ref(props.open)
watch(() => props.open, (val) => {
  openModel.value = val
})
watch(openModel, (val) => {
  if (!val) {
    emit('update:open', false)
  }
})

const width = ref(props.column.width)
const order = ref(props.column.order)
const fixed = ref<'left' | 'right' | ''>(props.column.fixed)
const visible = ref(props.column.visible)

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    width.value = props.column.width
    order.value = props.column.order
    fixed.value = props.column.fixed
    visible.value = props.column.visible
  }
})

const fixedOptions = [
  { label: '不固定', value: '' },
  { label: '左侧固定', value: 'left' },
  { label: '右侧固定', value: 'right' }
]

function handleSave() {
  emit('save', {
    userId: loginUser.value?.id ?? 0,
    tableColumnId: props.column.tableColumnId ?? 0,
    width: width.value,
    order: order.value,
    fixed: fixed.value,
    visible: visible.value
  })
}
</script>

<template>
  <UModal
    v-model:open="openModel"
    title="编辑列设置"
    :close="{ onClick: () => emit('close') }"
  >
    <div class="p-4 space-y-4">
      <div class="text-sm text-dimmed mb-2">
        列名: {{ column.label }} ({{ column.columnKey }})
      </div>

      <UFormField label="宽度">
        <UInputNumber
          v-model="width"
          :min="0"
          class="w-full"
        />
      </UFormField>

      <UFormField label="顺序">
        <UInputNumber
          v-model="order"
          :min="0"
          class="w-full"
        />
      </UFormField>

      <UFormField label="固定位置">
        <USelect
          v-model="fixed"
          :items="fixedOptions"
          class="w-full"
        />
      </UFormField>

      <UFormField label="可见">
        <UCheckbox v-model="visible" label="显示此列" />
      </UFormField>
    </div>

    <template #footer>
      <UButton
        label="取消"
        color="neutral"
        variant="subtle"
        @click="emit('close')"
      />
      <UButton
        label="保存"
        color="primary"
        variant="solid"
        :loading="loading"
        @click="handleSave"
      />
    </template>
  </UModal>
</template>
