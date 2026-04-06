<script setup lang="ts" generic="T">
import { computed } from 'vue'
import type { VFormFieldProps } from '#v/types'
import FormFieldInput from './Input.vue'
import FormFieldDynamicInput from './DynamicInput.vue'
import FormFieldDynamicObjectInput from './DynamicObjectInput.vue'
import FormFieldInputStringNumber from './InputStringNumber.vue'
import FormFieldInputPassword from './InputPassword.vue'
import FormFieldButtonSwitch from './ButtonSwitch.vue'
import FormFieldSelect from './Select.vue'
import FormFieldAsyncSelect from './AsyncSelect.vue'
import FormFieldAsyncObjectSelect from './AsyncObjectSelect.vue'
import FormFieldDatePicker from './DatePicker.vue'
import FormFieldAsyncTreeSelect from './AsyncTreeSelect.vue'
import FormFieldTreeSelectTransfer from './TreeSelectTransfer.vue'
import FormFieldSqlEditor from './SqlEditor.vue'

const props = defineProps<{
  field: VFormFieldProps
  onTriggerSubmit?: (e: Event) => void
}>()

const modelValue = defineModel<Partial<T>>('modelValue', { required: true })

const fieldModelValue = computed({
  get: () => (modelValue.value as any)[props.field.name ?? ''],
  set: (newValue) => {
    (modelValue.value as any)[props.field.name ?? ''] = newValue
  }
})
</script>

<template>
  <USeparator
    v-if="field.type === 'separator'"
    :label="field.separatorLabel"
    :ui="{
      label: 'text-dimmed text-xs'
    }"
    type="dashed"
    size="xs"
    class="mt-2 -mb-2"
  />
  <FormFieldInput
    v-else-if="field.type === 'input'"
    v-model="fieldModelValue"
    :disabled="field.disabled"
    :placeholder="field.placeholder"
    :enter-keydown-submit="field.enterKeydownSubmit"
    @trigger-submit="onTriggerSubmit"
  />
  <FormFieldDynamicInput
    v-else-if="field.type === 'dynamic-input'"
    v-model="fieldModelValue"
    :delimiter="field.delimiter"
    :disabled="field.disabled"
  />
  <FormFieldDynamicObjectInput
    v-else-if="field.type === 'dynamic-input-object'"
    v-model="fieldModelValue"
    :object-fields="field.objectFields"
    :field-name="field.name"
    :disabled="field.disabled"
  />
  <FormFieldInputStringNumber
    v-else-if="field.type === 'input-string-number'"
    v-model="fieldModelValue"
    :disabled="field.disabled"
    :placeholder="field.placeholder"
    :trailing-string="field.trailingString"
  />
  <UInputNumber
    v-else-if="field.type === 'input-number'"
    v-model="fieldModelValue"
    :disabled="field.disabled"
    :placeholder="field.placeholder"
    orientation="vertical"
  />
  <FormFieldInputPassword
    v-else-if="field.type === 'input-pwd'"
    v-model="fieldModelValue"
    :placeholder="field.placeholder"
    :disabled="field.disabled"
    :enter-keydown-submit="field.enterKeydownSubmit"
    @trigger-submit="onTriggerSubmit"
  />
  <div v-else-if="field.type === 'switch'" class="flex items-center h-8">
    <USwitch
      v-model="fieldModelValue"
      unchecked-icon="i-lucide-x"
      checked-icon="i-lucide-check"
      :disabled="field.disabled"
      size="xl"
    />
  </div>
  <FormFieldButtonSwitch
    v-else-if="field.type === 'button-switch'"
    v-model="fieldModelValue"
    :disabled="field.disabled"
  />
  <UTextarea
    v-else-if="field.type === 'textarea'"
    v-model="fieldModelValue"
    class="w-full"
    autoresize
    :disabled="field.disabled"
  />
  <FormFieldDatePicker
    v-else-if="field.type === 'date-picker'"
    v-model="fieldModelValue"
    :disabled="field.disabled"
    :peer-buttons="field.peerButtons"
  />
  <FormFieldSelect
    v-else-if="field.type === 'select'"
    v-model="fieldModelValue"
    :items="field.items"
    :searchable="field.searchable ?? false"
    :icon="field.icon ? field.icon : (field.multiple ? 'i-lucide-list-todo' : undefined)"
    :enable-empty-option="field.enableEmptyOption"
    :placeholder="field.placeholder"
    value-key="value"
    :disabled="field.disabled"
  />
  <USelectMenu
    v-else-if="field.type === 'multiple-select-string'"
    :model-value="fieldModelValue ? fieldModelValue.split(',') : []"
    :items="field.items"
    :search-input="field.searchable ?? false"
    value-key="value"
    class="w-full"
    multiple
    :placeholder="field.placeholder"
    :icon="field.icon ? field.icon : 'i-lucide-list-todo'"
    :disabled="field.disabled"
    @update:model-value="newVal => fieldModelValue = newVal.join(',')"
  />
  <FormFieldAsyncSelect
    v-else-if="field.type === 'async-select'"
    v-model="fieldModelValue"
    :icon="field.icon"
    :list-api="field.listApi"
    :extra-query="field.extraQuery"
    :init-model-values="field.initModelValues"
    :search-fields="field.searchFields"
    :label-field="field.labelField"
    :label-render-fn="field.labelRenderFn"
    :value-field="field.valueField"
    :multiple="field.multiple"
    :placeholder="field.placeholder"
    :disabled="field.disabled"
    :enable-empty-option="field.enableEmptyOption"
    :extra-search-field-fn="field.extraSearchFieldFn"
    :can-create="field.canCreate"
    :create-modal-component="field.createModalComponent"
    :create-modal-open-props="field.createModalOpenProps"
    @update-init-model-values="field.onUpdateInitModelValues"
  />
  <FormFieldAsyncObjectSelect
    v-else-if="field.type === 'async-object-select'"
    v-model="fieldModelValue"
    :icon="field.icon"
    :list-api="field.listApi"
    :extra-query="field.extraQuery"
    :init-model-values="field.initModelValues"
    :search-fields="field.searchFields"
    :label-field="field.labelField"
    :label-render-fn="field.labelRenderFn"
    :value-field="field.valueField"
    :multiple="field.multiple"
    :placeholder="field.placeholder"
    :disabled="field.disabled"
    @update-init-model-values="field.onUpdateInitModelValues"
  />
  <FormFieldAsyncTreeSelect
    v-else-if="field.type === 'async-tree-select'"
    v-model="fieldModelValue"
    :icon="field.icon"
    :list-api="field.listApi"
    :extra-query="field.extraQuery"
    :init-model-values="field.initModelValues"
    :search-fields="field.searchFields"
    :label-field="field.labelField"
    :value-field="field.valueField"
    :multiple="field.multiple"
    :placeholder="field.placeholder"
    :fetch-all="field.fetchAll"
    :disabled="field.disabled"
    @update-init-model-values="field.onUpdateInitModelValues"
  />
  <FormFieldTreeSelectTransfer
    v-else-if="field.type === 'tree-select-transfer'"
    :source-tree-items="field.sourceTreeItems"
    :target-tree-items="field.targetTreeItems"
    :disabled="field.disabled"
    @update-target-tree-items="field.onUpdateTargetTreeItems"
  />
  <URadioGroup
    v-else-if="field.type === 'radio-select'"
    v-model="fieldModelValue"
    :items="field.items"
    :color="field.color"
    :variant="field.variant"
    :size="field.size"
    :orientation="field.orientation"
    :disabled="field.disabled"
  />
  <FormFieldSqlEditor
    v-else-if="field.type === 'sql-editor'"
    v-model="fieldModelValue"
  />
  <component
    :is="field.component"
    v-else-if="field.type === 'custom'"
  />
  <div v-else>
    未实现的form组件类型 {{ field.type }}
  </div>
</template>
