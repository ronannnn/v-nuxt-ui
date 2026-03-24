<script setup lang="ts" generic="T">
import type { SelectMenuItem } from '@nuxt/ui'
import defu from 'defu'
import type { QueryTemplate, VFormFieldAsyncSelectProps } from '../../../../types'

const props = withDefaults(defineProps<VFormFieldAsyncSelectProps<T> & { icon?: string, disabled?: boolean }>(), {
  labelField: 'name' as any,
  valueField: 'id' as any,
  extraQuery: () => ({
    pagination: { pageNum: 1, pageSize: 10 },
    orderQuery: [
      { field: 'createdAt', order: 'desc' }
    ]
  })
})

const modelValue = defineModel<string[] | number[] | number | string | null | undefined>('modelValue', { required: true })

const open = ref(false)
const searchTerm = ref<string>('')
const searchedData = ref<T[]>([])

const currentSelectedData = computed<T[]>(() => [props.initModelValues ?? []].flat() as T[])
// searched Data + current Selected Data
const allData = computed<T[]>(() => {
  const newSearchedData: T[] = []
  if (props.enableEmptyOption) {
    newSearchedData.push({
      [props.valueField]: 0,
      [props.labelField]: '无'
    } as T)
  }
  newSearchedData.push(...currentSelectedData.value)
  searchedData.value.forEach((searchedItem) => {
    const idx = newSearchedData.findIndex(item => (item as any)[props.valueField] === (searchedItem as any)[props.valueField])
    if (idx === -1) {
      newSearchedData.push(searchedItem as T)
    }
  })
  return newSearchedData
})

const items = computed<SelectMenuItem[]>(() => fetching.value
  ? currentSelectedData.value
      .map((p: T) => ({
        label: String(props.labelRenderFn ? props.labelRenderFn(p) : (p as any)[props.labelField] ?? ''),
        value: (p as any)[props.valueField]
      }))
      .filter(p => p.label && !isEmptyString(String(p.value)))
  : allData.value
      .map((p: T) => ({
        label: String(props.labelRenderFn ? props.labelRenderFn(p) : (p as any)[props.labelField] ?? ''),
        value: (p as any)[props.valueField]
      }))
      .filter(p => p.label && !isEmptyString(String(p.value)))
)
const onSelect = (newVal: any) => {
  modelValue.value = newVal

  if (Array.isArray(newVal)) {
    const newInitModelValues: T[] = []
    newVal.forEach((val) => {
      const foundItem = allData.value.find(p => (p as any)[props.valueField] === val)
      if (foundItem) {
        newInitModelValues.push(foundItem)
      }
    })
    props.onUpdateInitModelValues?.(newInitModelValues)
  } else {
    const newInitModelValues = allData.value.find(p => (p as any)[props.valueField] === newVal)
    props.onUpdateInitModelValues?.(newInitModelValues!)
  }
}

const { fetching, startFetching, endFetching } = useFetching()
const onFetchItems = async () => {
  try {
    startFetching()
    const query: QueryTemplate<T> = {
      pagination: { pageNum: 1, pageSize: 10 },
      whereQuery: { items: [] }
    }
    if (!isEmptyString(searchTerm.value)) {
      props.searchFields.forEach((field) => {
        query.whereQuery?.items?.push({ field, opr: 'like', value: searchTerm.value, andOr: 'or' })
      })
    }
    if (props.extraSearchFieldFn !== undefined) {
      query.whereQuery?.items?.push(props.extraSearchFieldFn(searchTerm.value))
    }
    const result = await props.listApi(defu(query, props.extraQuery))
    if (result.data) {
      searchedData.value = result.data.value.data?.list ?? []
    }
  } finally {
    endFetching()
  }
}
const onDebounceFetchItems = useDebounceFn(onFetchItems, 512)
</script>

<template>
  <USelectMenu
    :open="open"
    :model-value="modelValue"
    :search-term="searchTerm"
    :items="items"
    value-key="value"
    ignore-filter
    :multiple="multiple"
    :icon="icon ? icon : (multiple ? 'i-lucide-list-todo' : 'i-lucide-list')"
    :loading="fetching"
    :placeholder="placeholder"
    class="w-full"
    :search-input="{
      icon: 'i-lucide-search',
      loading: fetching
    }"
    :disabled="disabled"
    :reset-search-term-on-select="false"
    :ui="{ content: !useApp().isMobile.value && 'min-w-fit' }"
    @update:open="newOpen => {
      open = newOpen
      if (newOpen) {
        onFetchItems()
      }
      else {
        searchTerm = ''
      }
    }"
    @update:search-term="newValue => {
      if (!open) return
      searchTerm = newValue
      onDebounceFetchItems()
    }"
    @update:model-value="onSelect"
  />
</template>
