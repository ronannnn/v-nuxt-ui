<script setup lang="ts" generic="T">
import type { QueryTemplate, SelectOption, VFormFieldAsyncSelectProps, WhereQueryItem } from '../../../../../../../../types'
import type { CommandPaletteGroup } from '@nuxt/ui'
import defu from 'defu'

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
const searchTerm = ref<string>('')
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
const items = computed<SelectOption[]>(() => {
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
const commandPaletteValue = computed<(string | number)[] | null>({
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

const commandPaletteGroups = computed(() => {
  const options: CommandPaletteGroup<any>[] = [
    {
      id: 'fields',
      items: items.value,
      ignoreFilter: true
    }
  ]
  return options
})

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
    const result = await props.listApi(defu(query, props.extraQuery))
    if (result.data) {
      searchedData.value = result.data.value.data?.list ?? []
    }
  } finally {
    endFetching()
  }
}
const onDebounceFetchItems = useDebounceFn(onFetchItems, 512)

const dropdownBtnRef = useTemplateRef('dropdownBtn')
defineExpose({
  focus: () => {
    dropdownBtnRef.value?.focus()
  }
})
</script>

<template>
  <ProButtonDropdown
    ref="dropdownBtn"
    v-model="commandPaletteValue"
    :groups="commandPaletteGroups"
    multiple
    enable-footer-toolbar
    @open="onFetchItems"
    @search="onDebounceFetchItems"
  >
    <UButton
      size="sm"
      color="neutral"
      variant="outline"
    >
      <div v-if="!whereQueryItem?.value || whereQueryItem.value.length === 0">
        --
      </div>
      <div v-else-if="whereQueryItem.value.length <= 2" class="flex items-center gap-1">
        {{ whereQueryItem.value.map((value: any) => items.find(item => item.value === value)?.label || value).join(', ') }}
      </div>
      <div v-else>
        <!-- 打印前两项,后面+1代替 -->
        <div class="flex items-center gap-1">
          <div v-for="value in whereQueryItem.value.slice(0, 2)" :key="value">
            {{ items.find(item => item.value === value)?.label || value }}
          </div>
          <span>+{{ whereQueryItem.value.length - 2 }}</span>
        </div>
      </div>
    </UButton>
  </ProButtonDropdown>
</template>
