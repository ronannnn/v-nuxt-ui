<script setup lang="ts" generic="T">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { WhereQueryOption, WhereQueryItem } from '#v/types'
import { computed, shallowRef, useTemplateRef, watch } from 'vue'
import TableQueryWhereSimpleItemOprPicker from '#v/components/table/query/where/simple/item/OprPicker.vue'
import TableQueryWhereSimpleItemOpr from '#v/components/table/query/where/simple/item/opr/index.vue'
import ButtonConfirm from '#v/components/button/Confirm.vue'
import { tableWhereQueryItemIconMap } from '#v/constants'

type WhereQuerySection = 'preferred' | 'other'
type HandlePointerStart = {
  clientX: number
  clientY: number
  wasOpen: boolean
}

const CLICK_DISTANCE = 4

const props = defineProps<{
  options: WhereQueryOption<T>[]
  fetching?: boolean
  triggerFetching?: () => Promise<void>
  onRemove: (field: string) => void
  handleClassName?: string
  section: WhereQuerySection
}>()
const emit = defineEmits<{
  moveSection: [field: string, section: WhereQuerySection]
}>()
const whereQueryItem = defineModel<WhereQueryItem<T>>('whereQueryItem', { required: true })

const option = computed(() => props.options.find(option => option.field === whereQueryItem.value.field))
const moveMenuOpen = shallowRef(false)
let handlePointerStart: HandlePointerStart | null = null
const moveSectionItems = computed<DropdownMenuItem[]>(() => {
  const targetSection = props.section === 'preferred' ? 'other' : 'preferred'
  return [{
    label: props.section === 'preferred' ? '移动到其他查询条件' : '移动到常用查询条件',
    icon: props.section === 'preferred' ? 'i-lucide-folder-input' : 'i-lucide-star',
    onSelect: () => emit('moveSection', whereQueryItem.value.field as string, targetSection)
  }]
})

function onHandlePointerDown(event: PointerEvent) {
  handlePointerStart = {
    clientX: event.clientX,
    clientY: event.clientY,
    wasOpen: moveMenuOpen.value
  }
}

// 拖拽库可能吞掉一次 click。这里只兜底打开，不反向关闭，避免和 DropdownMenuTrigger 抢状态。
function onHandlePointerUp(event: PointerEvent) {
  const start = handlePointerStart
  handlePointerStart = null
  if (!start || start.wasOpen) return

  const distance = Math.hypot(
    event.clientX - start.clientX,
    event.clientY - start.clientY
  )

  if (distance > CLICK_DISTANCE) return

  window.setTimeout(() => {
    if (!moveMenuOpen.value) {
      moveMenuOpen.value = true
    }
  })
}

watch(
  () => option.value?.custom,
  (newCustom) => {
    if (whereQueryItem.value.custom === newCustom) return
    whereQueryItem.value = { ...whereQueryItem.value, custom: newCustom }
  },
  { immediate: true }
)

const oprRef = useTemplateRef('opr')
defineExpose({
  focus: () => oprRef.value?.focus()
})
</script>

<template>
  <div class="w-full flex flex-col group/where-item">
    <div class="flex items-center rounded-t-md bg-elevated/40 border border-b-0 border-accented">
      <!-- <TableQueryWhereSimpleItemColumnPicker
        v-model:where-query-item="whereQueryItem"
        :options="options"
        :fetching="fetching"
        disabled
        class="!bg-elevated/40"
        :focus="() => oprRef?.focus()"
      /> -->
      <div class="flex-1 flex items-center gap-1 pl-2.5">
        <UIcon :name="tableWhereQueryItemIconMap.get(option?.type ?? 'unknown') || 'field'" class="size-3.5 text-highlighted" />
        <span class="text-xs font-bold text-highlighted">
          {{ option?.label ?? whereQueryItem.field }}
        </span>
      </div>
      <ButtonConfirm
        class="rounded-br-none opacity-0 transition-all group-hover/where-item:opacity-100 max-md:opacity-100"
        @confirm="onRemove(whereQueryItem.field as string)"
      />
    </div>
    <UFieldGroup size="sm" class="w-full">
      <TableQueryWhereSimpleItemOprPicker
        v-model:where-query-item="whereQueryItem"
        :options="options"
        :fetching="fetching"
        :focus="() => oprRef?.focus()"
        :disabled="option?.disableOprSelector"
        button-class="rounded-t-none bg-default text-muted font-normal"
      />
      <TableQueryWhereSimpleItemOpr
        ref="opr"
        v-model:where-query-item="whereQueryItem"
        :options="options"
        :fetching="fetching"
        :trigger-fetching="triggerFetching"
        class="w-full"
      />
      <UDropdownMenu v-model:open="moveMenuOpen" :items="moveSectionItems" size="sm">
        <UButton
          variant="outline"
          icon="i-lucide-grip-vertical"
          color="neutral"
          class="cursor-move hover:bg-default active:bg-default rounded-t-none"
          :class="handleClassName"
          aria-label="拖拽或移动查询条件分组"
          @pointerdown="onHandlePointerDown"
          @pointerup="onHandlePointerUp"
          @pointercancel="handlePointerStart = null"
        />
      </UDropdownMenu>
    </UFieldGroup>
  </div>
</template>
