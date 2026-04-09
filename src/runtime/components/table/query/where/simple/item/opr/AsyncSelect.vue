<script setup lang="ts" generic="T">
import type { InputMenuItem } from '@nuxt/ui'
import { ref, computed, useTemplateRef, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { defu } from 'defu'
import { useFetching } from '#v/composables/useBoolean'
import { isEmptyString } from '#v/utils'
import type { VFormFieldAsyncSelectProps, WhereQueryItem, QueryTemplate } from '#v/types'

const props = withDefaults(defineProps<{
  label: string
  disabled?: boolean
  triggerFetching?: () => Promise<void>
} & VFormFieldAsyncSelectProps<T>>(), {
  labelField: 'name' as any,
  valueField: 'id' as any,
  size: 'sm'
})

const whereQueryItem = defineModel<WhereQueryItem<T>>('whereQueryItem', { required: true })

const { fetching, startFetching, endFetching } = useFetching()
const searchedData = ref<T[]>([])

const currentSelectedData = computed<T[]>(() => [...whereQueryItem.value.extraData ?? []].flat() as T[])
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
    const idx = newSearchedData.findIndex(item => item[props.valueField] === (searchedItem as any)[props.valueField])
    if (idx === -1) {
      newSearchedData.push(searchedItem as T)
    }
  })
  return newSearchedData
})
const items = computed<InputMenuItem[]>(() => {
  return fetching.value
    ? currentSelectedData.value
        .map((p: T) => ({
          label: String(props.labelRenderFn ? props.labelRenderFn(p) : p[props.labelField] ?? ''),
          value: p[props.valueField]
        }))
        .filter(p => p.label && !isEmptyString(String(p.value)))
    : allData.value
        .map((p: T) => ({
          label: String(props.labelRenderFn ? props.labelRenderFn(p) : p[props.labelField] ?? ''),
          value: p[props.valueField]
        }))
        .filter(p => p.label && !isEmptyString(String(p.value)))
})
const inputMenuValue = computed<(string | number)[]>({
  get() {
    return whereQueryItem.value.value
  },
  set(newValues) {
    if (!newValues || newValues.length === 0) {
      whereQueryItem.value = { ...whereQueryItem.value, value: null }
      return
    }
    const newExtraData: T[] = []
    newValues.forEach((val) => {
      const foundItem = allData.value.find(p => p[props.valueField] === val)
      if (foundItem) {
        newExtraData.push(foundItem)
      }
    })
    whereQueryItem.value = {
      ...whereQueryItem.value,
      value: newValues,
      extraData: newExtraData
    }
  }
})

const onFetchItems = async (searchTerm: string) => {
  try {
    startFetching()
    const query: QueryTemplate<T> = {
      pagination: { pageNum: 1, pageSize: 10 },
      whereQuery: { items: [] }
    }
    if (!isEmptyString(searchTerm)) {
      props.searchFields.forEach((field) => {
        query.whereQuery?.items?.push({ field, opr: 'like', value: searchTerm, andOr: 'or' })
      })
    }
    const result = await props.listApi(defu(query, props.extraQuery))
    if (result.data) {
      searchedData.value = result.data.value.data?.list ?? []
    }
  } finally {
    endFetching()
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
    v-model:search-term="searchTerm"
    v-model="inputMenuValue"
    :items="items"
    :placeholder="placeholder"
    multiple
    color="neutral"
    delete-icon="i-lucide-trash"
    value-key="value"
    clear
    clear-icon="i-lucide-circle-x"
    icon=""
    :loading="fetching"
    :disabled="disabled"
    open-on-focus
    trailing
    :ui="{
      root: 'rounded-none min-w-32', // TODO: 不然有rounded，这个应该是个bug
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
    @update:model-value="() => {
      inputMenuRef?.inputRef.focus()
    }"
  />
</template>
