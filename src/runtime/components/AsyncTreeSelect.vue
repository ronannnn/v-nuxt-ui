<script setup lang="ts" generic="T">
import { ref, computed } from 'vue'
import { useFetching } from '#v/composables/useBoolean'
import type { AsyncSelectCombinedValue, AsyncSelectValue, QueryTemplate, VAsyncSelectProps } from '#v/types'
import { flattenTree, treeifyOptions, isEmptyString } from '#v/utils'
import type { TreeItem } from '@nuxt/ui'
import { defu } from 'defu'

const props = withDefaults(defineProps<VAsyncSelectProps<T>>(), {
  extraQuery: () => ({
    orderQuery: [
      { field: 'createdAt', order: 'desc' }
    ]
  })
})

const modelValue = defineModel<AsyncSelectCombinedValue>('modelValue', { required: true })
const treeModelValue = computed<T[] | undefined>(() => allModels.value.filter(item => item[props.valueField] === modelValue.value))

const open = ref(false)
const searchedModel = ref<T[]>([])

// models
const currentSelectedModels = computed<T[]>(() => [modelValue.value.extraModels ?? []].flat() as T[])
// searched Data + current Selected Data
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
const items = computed<TreeItem[]>(() => {
  const options = treeifyOptions(
    allModels.value,
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
const searchTerm = ref<string>('')
const onFetchItems = async () => {
  try {
    startFetching()
    const query: QueryTemplate<T> = {
      pagination: { pageNum: 1, pageSize: props.fetchAll ? 0 : 10 },
      whereQuery: { items: [] }
    }
    if (!isEmptyString(searchTerm.value)) {
      props.likeSearchFields?.forEach((field) => {
        query.whereQuery?.items?.push({ field, opr: 'like', value: searchTerm.value })
      })
    }
    const result = await props.listApi(defu(query, props.extraQuery))
    if (result.data) {
      searchedModel.value = result.data.value.data?.list ?? []
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
      :label="modelValue.values === 0 ? '无' : allModels.find(item => item[valueField] === modelValue.values)?.[labelField] as string ?? ' '"
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
