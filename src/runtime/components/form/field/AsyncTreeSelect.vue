<script setup lang="ts" generic="T extends Record<string, any>">
import { ref, computed } from 'vue'
import { useFetching } from '#v/composables/useBoolean'
import type { QueryTemplate, VFormFieldAsyncTreeSelectProps } from '#v/types'
import { flattenTree, treeifyOptions, isEmptyString } from '#v/utils'
import type { TreeItem } from '@nuxt/ui'
import { defu } from 'defu'

const props = withDefaults(defineProps<VFormFieldAsyncTreeSelectProps<T> & { icon?: string, disabled?: boolean }>(), {
  labelField: 'name' as any,
  valueField: 'id' as any,
  extraQuery: () => ({
    orderQuery: [
      { field: 'createdAt', order: 'desc' }
    ]
  })
})

const modelValue = defineModel<number | undefined>('modelValue', { required: true })
const treeModelValue = computed<T[] | undefined>(() => allData.value.filter(item => item[props.valueField] === modelValue.value))

const open = ref(false)
const searchTerm = ref<string>('')
const searchedData = ref<T[]>([])
// searched Data + current Selected Data
const allData = computed<T[]>(() => {
  const newSearchedData: T[] = [...searchedData.value] as T[]
  const flattenInitModelValues: T[] = [props.initModelValues ?? []].flat() as T[]
  flattenInitModelValues.forEach((initModelValue) => {
    const idx = newSearchedData.findIndex(item => item[props.valueField] === initModelValue[props.valueField])
    if (idx === -1) {
      newSearchedData.unshift(initModelValue)
    }
  })
  return newSearchedData
})

const onSelect = (newVal: number) => {
  modelValue.value = newVal
  const newInitModelValues = allData.value.find(p => p[props.valueField] === newVal)
  props.onUpdateInitModelValues?.(newInitModelValues!)
  open.value = false
}
const items = computed<TreeItem[]>(() => {
  const options = treeifyOptions(
    allData.value,
    onSelect,
    props.labelField,
    props.valueField,
    'parentId' as any
  )
  options.unshift({
    label: '无',
    value: 0 as any,
    onSelect: () => onSelect(0)
  })
  return options
})
const expandedItemValues = computed<string[]>(() => flattenTree(items.value).filter(item => item !== undefined).map(item => item.value ?? ''))

const { fetching, startFetching, endFetching } = useFetching()
const onFetchItems = async () => {
  try {
    startFetching()
    const query: QueryTemplate<T> = {
      pagination: { pageNum: 1, pageSize: props.fetchAll ? 0 : 10 },
      whereQuery: { items: [] }
    }
    if (!isEmptyString(searchTerm.value)) {
      props.searchFields.forEach((field) => {
        query.whereQuery?.items?.push({ field, opr: 'like', value: searchTerm.value })
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
</script>

<template>
  <UPopover
    :open="open"
    :ui="{
      content: 'min-w-(--reka-popover-trigger-width)'
    }"
    @update:open="newOpen => {
      open = newOpen
      if (newOpen) {
        onFetchItems()
      }
    }"
  >
    <UButton
      :label="modelValue === 0 ? '无' : allData.find(item => item[valueField] === modelValue)?.[labelField] as string ?? ' '"
      color="neutral"
      variant="outline"
      block
      icon="i-lucide-folder-tree"
      :loading="fetching"
      trailing-icon="i-lucide-chevron-down"
      :disabled="disabled"
      :ui="{
        leadingIcon: 'text-dimmed',
        trailingIcon: 'text-dimmed'
      }"
    />

    <template #content>
      <UTree
        :model-value="treeModelValue as any"
        :items="items"
        :disabled="fetching"
        :expanded="expandedItemValues"
        :get-key="i => i.value"
        multiple
        class="p-1 max-h-80 overflow-auto"
      />
    </template>
  </UPopover>
</template>
