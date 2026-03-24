<script setup lang="ts">
const modelValue = defineModel<string | null | undefined>('modelValue', { required: true })

const editorRef = useTemplateRef('editor')
const formatSQL = () => {
  editorRef.value?.formatSQL()
}
</script>

<template>
  <div class="flex flex-col divide-y divide-accented">
    <div class="border border-accented border-b-0 rounded-t-md p-3">
      <UButton
        icon="i-lucide-wand-sparkles"
        label="美化"
        size="xs"
        variant="subtle"
        @click="formatSQL"
      />
    </div>
    <ProSqlEditor
      ref="editor"
      v-model="modelValue"
      class="border border-accented border-t-0 rounded-b-md p-3"
    />
  </div>
</template>
