<script setup lang="ts">
const props = defineProps<{
  disabled?: boolean
  fieldName?: string
  objectFields: Array<{
    key: string
    label: string
    placeholder?: string
  }>
}>()

const modelValue = defineModel<Record<string, string>[] | undefined | null>('modelValue', { required: true })

const createEmptyRow = () => {
  const row: Record<string, string> = {}
  props.objectFields.forEach((field) => {
    row[field.key] = ''
  })
  return row
}

function updateCell(rowIdx: number, key: string, val: string | number) {
  const newList = [...(modelValue.value ?? [])]
  const row = { ...(newList[rowIdx] ?? createEmptyRow()) }
  row[key] = String(val ?? '')
  newList[rowIdx] = row
  modelValue.value = newList
}

function removeRow(rowIdx: number) {
  const newList = [...(modelValue.value ?? [])]
  newList.splice(rowIdx, 1)
  modelValue.value = newList
}

function addRow() {
  const newList = [...(modelValue.value ?? [])]
  newList.push(createEmptyRow())
  modelValue.value = newList
}
</script>

<template>
  <div class="flex flex-col gap-2 w-full">
    <div
      v-for="(row, idx) in (modelValue ?? [])"
      :key="idx"
      class="flex items-center gap-2"
    >
      <div class="grid grid-cols-2 gap-2 flex-1">
        <UInput
          v-for="field in objectFields"
          :key="field.key"
          :model-value="row[field.key]"
          :placeholder="field.placeholder"
          :disabled="disabled"
          class="w-full"
          @update:model-value="(val) => updateCell(idx, field.key, val)"
        />
      </div>
      <div class="flex gap-1">
        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-minus"
          :disabled="disabled"
          @click="removeRow(idx)"
        />
        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-plus"
          :disabled="disabled"
          @click="addRow"
        />
      </div>
    </div>
    <div class="flex justify-start">
      <UButton
        color="neutral"
        variant="soft"
        icon="i-lucide-plus"
        size="xs"
        :disabled="disabled"
        @click="addRow"
      >
        新增一行
      </UButton>
    </div>
  </div>
</template>
