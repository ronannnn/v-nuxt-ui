<script setup lang="ts" generic="T">
import type { InputMenuItem } from '@nuxt/ui'
import { ref, computed, useTemplateRef, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { defu } from 'defu'
import { useFetching } from '#v/composables/useBoolean'
import { isEmptyString } from '#v/utils'
import type { AsyncSelectCombinedValue, AsyncSelectValue, QueryTemplate, VAsyncSelectProps } from '#v/types'
import { useOverlay } from '@nuxt/ui/composables'

const props = withDefaults(defineProps<VAsyncSelectProps<T> & { noRounded?: boolean }>(), {
  size: 'sm'
})

const overlay = useOverlay()

const modelValue = defineModel<AsyncSelectCombinedValue>('modelValue', { required: true })

const { fetching, startFetching, endFetching } = useFetching()
const searchedModel = ref<T[]>([])

// models
const currentSelectedModels = computed<T[]>(() => [modelValue.value.extraModels ?? []].flat() as T[])
// searched Model + current Selected Model
const allModels = computed<T[]>(() => {
  const newSearchedModel: T[] = []
  if (props.enableEmptyOption) {
    newSearchedModel.push({
      [props.valueField]: 0,
      [props.labelField]: '无'
    } as T)
  }
  newSearchedModel.push(...currentSelectedModels.value)
  searchedModel.value.forEach((searchedItem) => {
    const idx = newSearchedModel.findIndex(item => item[props.valueField] === (searchedItem as any)[props.valueField])
    if (idx === -1) {
      newSearchedModel.push(searchedItem as T)
    }
  })
  return newSearchedModel
})

// items
const items = computed<InputMenuItem[]>(() => {
  const models = fetching.value ? currentSelectedModels.value : allModels.value
  return models
    .map((p: T) => ({
      label: String(props.labelRenderFn ? props.labelRenderFn(p) : p[props.labelField] ?? ''),
      value: p[props.valueField]
    }))
    .filter(p => p.label && !isEmptyString(String(p.value)))
})

const onFetchItems = async (searchTerm: string) => {
  try {
    startFetching()
    const query: QueryTemplate<T> = {
      pagination: { pageNum: 1, pageSize: 10 },
      whereQuery: { items: [] }
    }
    if (!isEmptyString(searchTerm)) {
      props.likeSearchFields?.forEach((field) => {
        query.whereQuery?.items?.push({ field, opr: 'like', value: searchTerm, andOr: 'or' })
      })
      query.whereQuery?.items?.push(...props.searchFields?.(searchTerm) ?? [])
    }
    const result = await props.listApi(defu(query, props.extraQuery))
    if (result.data) {
      searchedModel.value = result.data.value.data?.list ?? []
    }
  } finally {
    endFetching()
  }
}

const onCreateNew = async () => {
  if (!props.createModalComponent) return
  const modal = overlay.create(props.createModalComponent)
  modal.open({
    model: { id: 0 },
    ...props.createModalOpenProps,
    onSave: (newModel: T) => {
      searchedModel.value.push(newModel as any)
      const newValue = newModel[props.valueField] as any
      if (props.multiple) {
        modelValue.value = {
          values: Array.isArray(modelValue.value.values) ? [...modelValue.value.values, newValue] : [newValue],
          extraModels: [...(modelValue.value.extraModels ?? []), newModel]
        }
      } else {
        modelValue.value = {
          values: newValue,
          extraModels: [newModel]
        }
      }
    }
  })
}

const onSelect = (values: AsyncSelectValue) => {
  if (props.multiple) {
    const newValues = Array.isArray(values) ? values : []
    const newExtraModels = allModels.value.filter(m => newValues.includes(m[props.valueField] as never))
    modelValue.value = {
      values: newValues,
      extraModels: newExtraModels
    }
  } else {
    const newValue = values as string | number
    const newExtraModel = allModels.value.find(m => m[props.valueField] === newValue)
    modelValue.value = {
      values: newValue,
      extraModels: newExtraModel ? [newExtraModel] : []
    }
  }
}

const searchTerm = ref('')
const onDebounceFetchItems = useDebounceFn(onFetchItems, 512)
watch(searchTerm, (newVal) => {
  onDebounceFetchItems(newVal)
}, { immediate: false })

const inputMenuRef = useTemplateRef('inputMenu')
defineExpose({
  focus: () => {
    inputMenuRef.value?.inputRef.focus()
  }
})
</script>

<template>
  <UInputMenu
    ref="inputMenu"
    :model-value="modelValue.values"
    :search-term="searchTerm"
    :items="items"
    :multiple="multiple"
    :size="size"
    :create-item="canCreate && createModalComponent && {
      position: 'top',
      when: 'always'
    }"
    :reset-search-term-on-select="false"
    color="neutral"
    delete-icon="i-lucide-trash"
    value-key="value"
    clear
    clear-icon="i-lucide-circle-x"
    :icon="icon"
    :loading="fetching"
    :disabled="disabled"
    open-on-focus
    trailing
    :ui="{
      root: 'min-w-32' + (noRounded ? ' rounded-none' : ''),
      base: 'peer',
      content: 'min-w-fit',
      tagsInput: 'min-w-4 w-0'
    }"
    :content="{
      align: 'start'
    }"
    @update:open="opened => {
      if (opened) {
        onFetchItems(searchTerm)
      }
    }"
    @update:model-value="(newValues) => {
      console.log(newValues)
      onSelect(newValues)
      inputMenuRef?.inputRef.focus()
    }"
    @create="onCreateNew"
  >
    <label class="pointer-events-none absolute left-0 -top-2.5 text-highlighted text-xs font-medium px-1.5 transition-all peer-focus:-top-2.5 peer-focus:text-highlighted peer-focus:text-xs peer-focus:font-medium peer-placeholder-shown:text-sm peer-placeholder-shown:text-dimmed peer-placeholder-shown:top-1.5 peer-placeholder-shown:font-normal">
      <span class="inline-flex bg-default px-1">{{ placeholder }}</span>
    </label>
  </UInputMenu>
</template>
