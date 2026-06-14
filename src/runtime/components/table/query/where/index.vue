<script setup lang="ts" generic="T">
import type { ComponentPublicInstance } from 'vue'
import type { WhereQueryItem, WhereQueryItemGroup, WhereQueryProps } from '#v/types'
import type { DropdownMenuItem } from '@nuxt/ui'
import { computed, ref, reactive, watch, nextTick, useTemplateRef } from 'vue'
import { useElementSize } from '@vueuse/core'
import { useTableOpr } from '#v/composables/table/useTableOpr'
import { useToast } from '@nuxt/ui/composables'
import UFieldGroup from '@nuxt/ui/components/FieldGroup.vue'
import UDropdownMenu from '@nuxt/ui/components/DropdownMenu.vue'
import Dnd from '#v/components/Dnd.client.vue'
import ScrollArea from '#v/components/ScrollArea.vue'
import TableQueryWhereSimpleItem from '#v/components/table/query/where/simple/item/index.vue'
import TableQueryWhereNewer from '#v/components/table/query/where/Newer.vue'

const props = defineProps<WhereQueryProps<T> & {
  panelMaxHeight?: number
}>()

const actionBarRef = useTemplateRef<HTMLElement>('actionBar')
const { height: actionBarHeight } = useElementSize(actionBarRef, undefined, { box: 'border-box' })
const panelStyle = computed(() =>
  props.panelMaxHeight ? { maxHeight: `${props.panelMaxHeight}px` } : undefined
)
const viewportStyle = computed(() => {
  if (!props.panelMaxHeight) return undefined
  return {
    maxHeight: `${Math.max(0, props.panelMaxHeight - actionBarHeight.value)}px`
  }
})

const whereOptionFieldSet = computed(() =>
  new Set(props.whereOptions.map(option => option.field as string))
)

function isValidWhereField(field: string | undefined) {
  return !!field && whereOptionFieldSet.value.has(field)
}

function filterValidItems(items: WhereQueryItem<T>[] = []) {
  return items.filter(item => isValidWhereField(item.field as string))
}

function filterValidGroups(groups: WhereQueryItemGroup<T>[] = []): WhereQueryItemGroup<T>[] {
  return groups
    .map((group) => {
      const items = filterValidItems(group.items)
      const childGroups = filterValidGroups(group.groups)
      return {
        ...group,
        items,
        groups: childGroups
      }
    })
    .filter(group => (group.items?.length ?? 0) > 0 || (group.groups?.length ?? 0) > 0)
}

const validWhereQueryItems = computed<WhereQueryItem<T>[]>(() =>
  filterValidItems(props.whereQuery?.items)
)

const validWhereQueryGroups = computed<WhereQueryItemGroup<T>[]>(() =>
  filterValidGroups(props.whereQuery?.groups)
)

watch([() => props.whereQuery, whereOptionFieldSet], () => {
  if (!props.whereQuery) return

  const currentItems = props.whereQuery.items ?? []
  const currentGroups = props.whereQuery.groups ?? []
  const items = filterValidItems(currentItems)
  const groups = filterValidGroups(currentGroups)
  const itemsChanged = items.length !== currentItems.length
  const groupsChanged = JSON.stringify(groups) !== JSON.stringify(currentGroups)

  if (!itemsChanged && !groupsChanged) return

  props.onUpdateWhereQuery({
    ...props.whereQuery,
    items,
    groups
  })
}, { immediate: true })

const selectedWhereFields = computed<string[]>(() => {
  return validWhereQueryItems.value.map(query => query.field as string)
})
const unselectedWhereFields = computed<string[]>(() => {
  return props.whereOptions.map(option => option.field as string).filter(field => !selectedWhereFields.value.includes(field))
})

const unselectedPreferredFields = computed<string[]>(() =>
  unselectedWhereFields.value.filter(field =>
    props.whereOptions.find(opt => opt.field === field)?.preferred !== false
  )
)
const unselectedOtherFields = computed<string[]>(() =>
  unselectedWhereFields.value.filter(field =>
    props.whereOptions.find(opt => opt.field === field)?.preferred === false
  )
)

// simple query: item ref map & helpers (merged from simple/index.vue)
const itemRefMap = ref<Map<string, { focus: () => void }>>(new Map())

function setItemRef(field: string, el: Element | ComponentPublicInstance | null) {
  if (el && 'focus' in el && typeof el.focus === 'function') {
    itemRefMap.value.set(field, el as { focus: () => void })
  } else {
    itemRefMap.value.delete(field)
  }
}

const onRemoveFilter = (field: string) => {
  const updatedItems = validWhereQueryItems.value.filter(query => query.field !== field)
  props.onUpdateWhereQuery({
    ...props.whereQuery,
    items: updatedItems,
    groups: validWhereQueryGroups.value
  })
}

const onNewField = (field: string) => {
  const option = props.whereOptions.find(option => option.field === field)
  if (!option || !option.type) {
    useToast().add({
      title: '无法添加查询条件',
      description: `无法找到字段 ${field} 的选项，或该选项缺少类型信息`,
      color: 'warning'
    })
    return
  }
  props.onUpdateWhereQuery({
    ...props.whereQuery,
    items: [...validWhereQueryItems.value, {
      field,
      opr: option.defaultOpr ?? useTableOpr().getDefaultOprByType(option.type),
      value: null,
      custom: option.custom
    }],
    groups: validWhereQueryGroups.value
  })
  nextTick(() => {
    const item = itemRefMap.value.get(field)
    if (item) {
      item.focus()
    }
  })
}

const getDefaultKeys = () => props.extraWhereQueryInitValues?.items?.map(query => query.field) ?? []

// 从列头筛选触发的聚焦
const whereQueryWithoutInitValues = computed<WhereQueryItem<T>[]>(() => {
  if (!props.whereQuery) return []
  const defaultKeys = getDefaultKeys()
  return validWhereQueryItems.value.filter((query) => {
    const field = query.field as string
    return !defaultKeys.includes(field)
  })
})

type WhereQuerySection = 'preferred' | 'other'

function getBaseItemSection(item: WhereQueryItem<T>): WhereQuerySection {
  return props.whereOptions.find(opt => opt.field === item.field)?.preferred === false ? 'other' : 'preferred'
}

// 分区覆盖标记存放在 item 顶层的 whereQuerySection 字段，
// 不与 extraData（异步下拉用于存放选中模型，可能是数组）冲突，
// 且会随 item 透传（编辑器 { ...whereQueryItem } 扩展）天然保留。
function getItemSection(item: WhereQueryItem<T>): WhereQuerySection {
  const section = item.whereQuerySection
  return section === 'preferred' || section === 'other' ? section : getBaseItemSection(item)
}

function isPreferredItem(item: WhereQueryItem<T>) {
  return getItemSection(item) === 'preferred'
}

function setItemSection(item: WhereQueryItem<T>, section: WhereQuerySection): WhereQueryItem<T> {
  // 与默认分区一致时清除覆盖，避免冗余持久化
  if (section === getBaseItemSection(item)) {
    const { whereQuerySection: _omit, ...rest } = item
    return rest as WhereQueryItem<T>
  }
  return { ...item, whereQuerySection: section }
}

const preferredItems = computed<WhereQueryItem<T>[]>(() =>
  whereQueryWithoutInitValues.value.filter(isPreferredItem)
)

const otherItems = computed<WhereQueryItem<T>[]>(() =>
  whereQueryWithoutInitValues.value.filter(item => !isPreferredItem(item))
)

const preferredDndItems = ref<WhereQueryItem<T>[]>([])
const otherDndItems = ref<WhereQueryItem<T>[]>([])

watch([preferredItems, otherItems], () => {
  preferredDndItems.value = [...preferredItems.value]
  otherDndItems.value = [...otherItems.value]
}, { immediate: true })

function updateWhereQuerySections(preferred: WhereQueryItem<T>[], other: WhereQueryItem<T>[]) {
  const defaultKeys = getDefaultKeys()
  const initItems = validWhereQueryItems.value.filter(q => defaultKeys.includes(q.field as string))
  props.onUpdateWhereQuery({
    ...props.whereQuery,
    items: [
      ...initItems,
      ...preferred.map(item => setItemSection(item, 'preferred')),
      ...other.map(item => setItemSection(item, 'other'))
    ],
    groups: validWhereQueryGroups.value
  })
}

function onDndEnd() {
  updateWhereQuerySections(preferredDndItems.value, otherDndItems.value)
}

function onMoveItemSection(field: string, section: WhereQuerySection) {
  const currentPreferredItems = [...preferredDndItems.value]
  const currentOtherItems = [...otherDndItems.value]
  const sourceItems = section === 'preferred' ? currentOtherItems : currentPreferredItems
  const item = sourceItems.find(item => item.field === field)
  if (!item) return

  const nextPreferredItems = section === 'preferred'
    ? [...currentPreferredItems, item]
    : currentPreferredItems.filter(item => item.field !== field)
  const nextOtherItems = section === 'other'
    ? [...currentOtherItems, item]
    : currentOtherItems.filter(item => item.field !== field)

  preferredDndItems.value = nextPreferredItems
  otherDndItems.value = nextOtherItems
  updateWhereQuerySections(nextPreferredItems, nextOtherItems)
}

function onUpdateWhereQueryItem(field: string, newWhereQueryItem: WhereQueryItem<T>) {
  const items = validWhereQueryItems.value
  const realIdx = items.findIndex(query => query.field === field)
  if (realIdx === -1) return
  const currentItem = items[realIdx]
  if (!currentItem) return
  const currentSection = getItemSection(currentItem)
  const updatedItems = [...items]
  updatedItems[realIdx] = setItemSection(newWhereQueryItem, currentSection)
  props.onUpdateWhereQuery({
    ...props.whereQuery,
    items: updatedItems,
    groups: validWhereQueryGroups.value
  })
}

const rangeOprList = ['range_gt_lt', 'range_gt_lte', 'range_gte_lt', 'range_gte_lte']
const isDateRangeQueryItem = (item: WhereQueryItem<T>) => {
  const option = props.whereOptions.find(option => option.field === item.field)
  return option?.type === 'date-picker' && rangeOprList.includes(item.opr as string)
}

// 清空数据：保留字段，值置空
const onClearValues = () => {
  if (!props.whereQuery?.items) return
  props.onUpdateWhereQuery({
    ...props.whereQuery,
    items: validWhereQueryItems.value.map(item => ({ ...item, value: null })),
    groups: validWhereQueryGroups.value
  })
}

// 还原默认：补全 initHide 不为 true 的字段，值全部置空，不删除已有字段
const onResetAll = () => {
  const currentItems = validWhereQueryItems.value
  const currentFields = new Set(currentItems.map(item => item.field as string))

  // 补全缺失的默认显示字段（initHide 不为 true）
  const missingOptions = props.whereOptions.filter(opt => !opt.initHide && !currentFields.has(opt.field as string))
  const newItems: WhereQueryItem<T>[] = missingOptions.map(opt => ({
    field: opt.field,
    opr: opt.defaultOpr ?? useTableOpr().getDefaultOprByType(opt.type),
    value: null,
    custom: opt.custom
  }))

  // 保留现有字段、值置空、追加缺失字段
  props.onUpdateWhereQuery({
    ...props.whereQuery,
    items: [
      ...currentItems.map(item => ({ ...item, value: null })),
      ...newItems
    ],
    groups: validWhereQueryGroups.value
  })
}

// 补全字段：将可查询但未出现的字段追加到列表后面（常用优先）
const onFillMissingFields = () => {
  const currentFields = new Set(validWhereQueryItems.value.map(item => item.field as string))
  const missingOptions = props.whereOptions.filter(opt => !currentFields.has(opt.field as string))
  if (missingOptions.length === 0) return

  const preferred = missingOptions.filter(opt => opt.preferred !== false)
  const other = missingOptions.filter(opt => opt.preferred === false)

  const newItems: WhereQueryItem<T>[] = [...preferred, ...other].map(opt => ({
    field: opt.field,
    opr: opt.defaultOpr ?? useTableOpr().getDefaultOprByType(opt.type),
    value: null,
    custom: opt.custom
  }))

  props.onUpdateWhereQuery({
    ...props.whereQuery,
    items: [...validWhereQueryItems.value, ...newItems],
    groups: validWhereQueryGroups.value
  })
}

// 删除所有字段：仅保留 init 值
const onRemoveAllFields = () => {
  const defaultKeys = props.extraWhereQueryInitValues?.items?.map(q => q.field) ?? []
  const initItems = validWhereQueryItems.value.filter(q => defaultKeys.includes(q.field as string))
  props.onUpdateWhereQuery({
    ...props.whereQuery,
    items: initItems.map(item => ({ ...item, value: null })),
    groups: validWhereQueryGroups.value
  })
}

const moreActions = computed<DropdownMenuItem[]>(() => [
  { label: '补全全部字段', icon: 'i-lucide-list-plus', onSelect: onFillMissingFields },
  { label: '清空全部字段', icon: 'i-lucide-trash-2', onSelect: onRemoveAllFields }
])

// 从列头筛选触发的聚焦
const focusField = (field: string): boolean => {
  if (!isValidWhereField(field)) {
    return false
  }
  const item = itemRefMap.value.get(field)
  if (item) {
    item.focus()
    return true
  }
  return false
}

const conditionListClass = 'grid grid-cols-24 gap-2.5'

const sections = reactive([
  { key: 'preferred' as const, label: '常用查询条件', dndItems: preferredDndItems, unselectedFields: unselectedPreferredFields },
  { key: 'other' as const, label: '其他查询条件', dndItems: otherDndItems, unselectedFields: unselectedOtherFields }
])

const empty = computed(() => sections.every(section => section.dndItems.length === 0))

defineExpose({ focusField })
</script>

<template>
  <div
    class="flex h-fit max-h-full flex-col divide-y divide-default overflow-hidden"
    :style="panelStyle"
  >
    <ScrollArea
      v-if="!empty"
      class="!h-fit"
      viewport-class="!h-auto"
      :viewport-style="viewportStyle"
    >
      <div class="@container p-4 space-y-6">
        <template
          v-for="section in sections"
          :key="section.key"
        >
          <div v-if="section.dndItems.length > 0">
            <div class="font-bold text-xs text-dimmed mb-2.5">
              {{ section.label }}
            </div>
            <Dnd
              v-model="section.dndItems"
              group="where-query"
              handle=".where-query-handle"
              :on-end="onDndEnd"
              :class="conditionListClass"
            >
              <div
                v-for="item in section.dndItems"
                :key="item.field"
                class="col-span-24 @2xl:col-span-12 @4xl:col-span-8 @6xl:col-span-6 @7xl:col-span-4"
                :class="isDateRangeQueryItem(item) ? 'col-span-24 @2xl:col-span-12 @4xl:col-span-12 @6xl:col-span-8 @7xl:col-span-8' : undefined"
              >
                <TableQueryWhereSimpleItem
                  :ref="(el) => setItemRef(item.field as string, el)"
                  :where-query-item="item"
                  :options="whereOptions"
                  :fetching="fetching"
                  :trigger-fetching="() => triggerFetching(true)"
                  handle-class-name="where-query-handle"
                  :section="section.key"
                  @remove="onRemoveFilter"
                  @move-section="onMoveItemSection"
                  @update:where-query-item="newWhereQueryItem => onUpdateWhereQueryItem(item.field as string, newWhereQueryItem)"
                />
              </div>
            </Dnd>
          </div>
        </template>
      </div>
    </ScrollArea>
    <!-- action bar -->
    <div ref="actionBar" class="shrink-0 flex items-center gap-2.5 p-4">
      <div class="flex-1 hidden sm:flex" />
      <div class="flex items-center gap-2.5">
        <TableQueryWhereNewer
          v-if="unselectedWhereFields.length > 0"
          :options="whereOptions"
          :unselected-fields="unselectedWhereFields"
          :biz-columns="bizColumns ?? []"
          size="sm"
          @new="onNewField"
        />
        <UButton
          v-if="!hideQueryButton"
          label="查询"
          color="neutral"
          variant="subtle"
          size="sm"
          :loading="fetching"
          icon="i-lucide-search"
          @click="async () => {
            await triggerFetching(true)
          }"
        />
        <UButton
          color="neutral"
          variant="subtle"
          size="sm"
          icon="i-lucide-eraser"
          :disabled="fetching"
          @click="onClearValues"
        >
          清空
        </UButton>
      </div>
      <div class="flex-1 flex justify-end items-center">
        <UFieldGroup size="sm">
          <UButton
            color="neutral"
            variant="subtle"
            icon="i-lucide-timer-reset"
            :disabled="fetching"
            @click="onResetAll"
          >
            恢复默认条件
          </UButton>
          <UDropdownMenu :items="moreActions" size="sm">
            <UButton
              color="neutral"
              variant="subtle"
              icon="i-lucide-ellipsis"
              :disabled="fetching"
            />
          </UDropdownMenu>
        </UFieldGroup>
      </div>
    </div>
  </div>
</template>
