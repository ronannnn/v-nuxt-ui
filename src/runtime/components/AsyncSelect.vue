<script setup lang="ts" generic="T">
import type { InputMenuItem } from '@nuxt/ui'
import { ref, computed, useTemplateRef, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { defu } from 'defu'
import { useFetching } from '#v/composables/useBoolean'
import { isEmptyString } from '#v/utils'
import type { AsyncSelectCombinedValue, AsyncSelectValue, QueryTemplate, VAsyncSelectProps } from '#v/types'
import { useOverlay } from '@nuxt/ui/composables'

const props = defineProps<VAsyncSelectProps<T>>()

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
  // 遍历 currentSelectedModels，如果其中的项在 searchedModel 中没有，则添加到 newSearchedModel 最前面
  currentSelectedModels.value.forEach((currentModel) => {
    const existInSearched = searchedModel.value.some(searched => (searched as T)[props.valueField] === currentModel[props.valueField])
    if (!existInSearched) {
      newSearchedModel.unshift(currentModel)
    }
  })
  newSearchedModel.push(...(searchedModel.value as T[]))
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

const ui = computed(() => ({
  root: ['min-w-32', props.roundedNone && 'rounded-none'].filter(Boolean).join(' '),
  base: 'peer',
  content: 'min-w-fit',
  tagsInput: 'min-w-4 w-0'
}))

const dropdownOpen = ref(false)
const searchTerm = ref('')
const onDebounceFetchItems = useDebounceFn(onFetchItems, 512)
watch(searchTerm, (newVal) => {
  if (dropdownOpen.value) {
    onDebounceFetchItems(newVal)
  }
}, { immediate: true })

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
    v-model:open="dropdownOpen"
    v-model:search-term="searchTerm"
    :model-value="modelValue.values"
    :items="items"
    :multiple="multiple"
    :size="size"
    :placeholder="placeholder"
    :create-item="canCreate && createModalComponent && {
      position: 'top',
      when: 'always'
    }"
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
    ignore-filter
    :ui="ui"
    :content="{
      align: 'start'
    }"
    @update:open="opened => {
      if (opened) {
        onFetchItems(searchTerm)
      }
    }"
    @update:model-value="onSelect"
    @create="onCreateNew"
  />
</template>
