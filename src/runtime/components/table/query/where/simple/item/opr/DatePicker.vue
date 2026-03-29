<script setup lang="ts" generic="T">
import type { WhereQueryItem, WhereQueryOpr } from '../../../../../../../types'
import type { DateRange, DateValue } from 'reka-ui'
import type { DateShortcut } from '../../../../../../../types/components/date'
import { computed, useTemplateRef, nextTick, ref } from 'vue'
import { now, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from '@internationalized/date'
import dayjs from 'dayjs'
import { useDate } from '#v/composables/useDate'
import { useApp } from '#v/composables/useApp'
import { dateFormat, TIME_ZONE } from '#v/constants/time'

defineProps<{
  disabled?: boolean
}>()

const whereQueryItem = defineModel<WhereQueryItem<T>>('whereQueryItem', { required: true })
const app = useApp()

// 操作符分类
const OPR_TYPES = {
  range: ['range_gt_lt', 'range_gt_lte', 'range_gte_lt', 'range_gte_lte'] as WhereQueryOpr[],
  singleStartOfDay: ['lt', 'gte'] as WhereQueryOpr[],
  singleEndOfDay: ['lte', 'gt'] as WhereQueryOpr[],
  noCalendar: ['is_null', 'is_not_null'] as WhereQueryOpr[]
}

const isRangeOpr = computed(() =>
  OPR_TYPES.range.includes(whereQueryItem.value.opr as WhereQueryOpr)
)

const isNoCalendarOpr = computed(() =>
  OPR_TYPES.noCalendar.includes(whereQueryItem.value.opr as WhereQueryOpr)
)

// 日历值计算
const calendarValue = computed<null | undefined | DateValue | DateValue[] | DateRange>({
  get() {
    const opr = whereQueryItem.value.opr as string
    const value = whereQueryItem.value.value

    if (OPR_TYPES.range.includes(opr as any)) {
      return {
        start: useDate().isoUtcStringToDateValue(value?.start),
        end: useDate().isoUtcStringToDateValue(value?.end)
      }
    }

    if ([...OPR_TYPES.singleStartOfDay, ...OPR_TYPES.singleEndOfDay].includes(opr as any)) {
      return useDate().isoUtcStringToDateValue(value)
    }

    return null
  },
  set(newValue) {
    const opr = whereQueryItem.value.opr as string
    let updatedValue: any = null

    if (OPR_TYPES.range.includes(opr as any)) {
      const range = newValue as DateRange
      updatedValue = {
        start: useDate().dateValueToDayjs(range?.start)?.startOf('day').format(),
        end: useDate().dateValueToDayjs(range?.end)?.endOf('day').format()
      }
    } else if (OPR_TYPES.singleStartOfDay.includes(opr as any)) {
      updatedValue = useDate().dateValueToDayjs(newValue as DateValue)?.startOf('day').format()
    } else if (OPR_TYPES.singleEndOfDay.includes(opr as any)) {
      updatedValue = useDate().dateValueToDayjs(newValue as DateValue)?.endOf('day').format()
    }

    whereQueryItem.value = { ...whereQueryItem.value, value: updatedValue }
  }
})

// 日期字符串输入处理
const createDateStrComputed = (
  getValue: () => string | undefined,
  setValue: (formattedDate: any) => void
) => computed<string | undefined>({
  get: getValue,
  set(newValue) {
    if (!newValue) {
      setValue(undefined)
      return
    }
    const formattedDayjs = dayjs(newValue, dateFormat, true)
    if (formattedDayjs.isValid()) {
      setValue(useDate().dayjsToDateValue(formattedDayjs))
    }
  }
})

// Range 输入
const startDateStrValueInput = useTemplateRef('startDateStrValueInput')
const startDateStrValue = createDateStrComputed(
  () => useDate().dateValueToDayjs((calendarValue.value as DateRange)?.start)?.format(dateFormat) ?? undefined,
  (start) => {
    calendarValue.value = { ...(calendarValue.value as DateRange), start }
  }
)
const endDateStrValue = createDateStrComputed(
  () => useDate().dateValueToDayjs((calendarValue.value as DateRange)?.end)?.format(dateFormat) ?? undefined,
  (end) => {
    calendarValue.value = { ...(calendarValue.value as DateRange), end }
  }
)

// Single 输入
const singleDateStrValueInput = useTemplateRef('singleDateStrValueInput')
const singleDateStrValue = createDateStrComputed(
  () => useDate().dateValueToDayjs(calendarValue.value as DateValue)?.format(dateFormat) || undefined,
  (date) => {
    calendarValue.value = date
  }
)

const dateStrInputFocus = () => {
  nextTick(() => {
    const input = isRangeOpr.value ? startDateStrValueInput : singleDateStrValueInput
    input.value?.focus()
  })
}

const popoverOpen = ref(false)

defineExpose({
  focus: () => {
    popoverOpen.value = true
    dateStrInputFocus()
  }
})

// 日期快捷方式
const dateRangeShortcuts: DateShortcut[] = [
  {
    label: '本周',
    dateFn: () => {
      const today = now(TIME_ZONE)
      return {
        start: startOfWeek(today, 'zh-CN', 'mon'),
        end: endOfWeek(today, 'zh-CN', 'mon')
      }
    }
  },
  {
    label: '本月',
    dateFn: () => {
      const today = now(TIME_ZONE)
      return {
        start: startOfMonth(today),
        end: endOfMonth(today)
      }
    }
  },
  {
    label: '上周',
    dateFn: () => {
      const today = now(TIME_ZONE)
      const lastWeek = today.subtract({ weeks: 1 })
      return {
        start: startOfWeek(lastWeek, 'zh-CN', 'mon'),
        end: endOfWeek(lastWeek, 'zh-CN', 'mon')
      }
    }
  },
  {
    label: '上月',
    dateFn: () => {
      const today = now(TIME_ZONE)
      const lastMonth = today.subtract({ months: 1 })
      return {
        start: startOfMonth(lastMonth),
        end: endOfMonth(lastMonth)
      }
    }
  }
]

const isValueEmpty = computed(() => {
  if (isNoCalendarOpr.value) return false

  const value = whereQueryItem.value.value
  if (isRangeOpr.value) {
    return value === null || (value?.start === null && value?.end === null)
  }

  return value === null || value === ''
})

const displayValue = computed(() => {
  if (isValueEmpty.value) return ''

  if (isRangeOpr.value) {
    const range = calendarValue.value as DateRange
    const start = useDate().dateValueToDayjs(range?.start)?.format(dateFormat) || ''
    const end = useDate().dateValueToDayjs(range?.end)?.format(dateFormat) || ''
    return `${start} ~ ${end}`
  }

  return useDate().dateValueToDayjs(calendarValue.value as DateValue)?.format(dateFormat) || ''
})
</script>

<template>
  <UPopover
    v-model:open="popoverOpen"
    :content="{
      align: 'start',
      onCloseAutoFocus: e => e.preventDefault()
    }"
  >
    <UButton size="sm" color="neutral" variant="outline">
      {{ isValueEmpty ? '--' : displayValue }}
    </UButton>

    <template #content>
      <div class="p-3 flex flex-col gap-2">
        <UFieldGroup v-if="isRangeOpr" :orientation="app.isMobile.value ? 'vertical' : 'horizontal'">
          <ProDatePickerInput
            ref="startDateStrValueInput"
            v-model:value="startDateStrValue"
            placeholder="YYYY/MM/DD 开始日期"
            :disabled="disabled"
          />
          <ProDatePickerInput
            ref="endDateStrValueInput"
            v-model:value="endDateStrValue"
            placeholder="YYYY/MM/DD 结束日期"
            :disabled="disabled"
          />
        </UFieldGroup>

        <ProDatePickerInput
          v-else
          ref="singleDateStrValueInput"
          v-model:value="singleDateStrValue"
          placeholder="YYYY/MM/DD 日期"
          :disabled="disabled"
        />

        <UCalendar
          v-if="!isNoCalendarOpr"
          :model-value="calendarValue"
          :range="isRangeOpr"
          size="sm"
          :disabled="disabled"
          :number-of-months="app.isMobile.value || !isRangeOpr ? 1 : 2"
          @update:model-value="(newValue) => calendarValue = newValue ?? null"
        />

        <div v-if="isRangeOpr" class="ml-auto">
          <UFieldGroup>
            <UButton
              v-for="shortcut in dateRangeShortcuts"
              :key="shortcut.label"
              :label="shortcut.label"
              size="xs"
              color="neutral"
              variant="outline"
              :disabled="disabled"
              @click="calendarValue = shortcut.dateFn()"
            />
          </UFieldGroup>
        </div>
      </div>
    </template>
  </UPopover>
</template>
