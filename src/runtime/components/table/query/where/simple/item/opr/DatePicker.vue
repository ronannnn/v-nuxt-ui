<script setup lang="ts" generic="T">
import type { WhereQueryItem, WhereQueryOpr, DateShortcut } from '#v/types'
import type { DateRange, DateValue } from 'reka-ui'
import { computed, useTemplateRef, nextTick, ref } from 'vue'
import { now } from '@internationalized/date'
import dayjs from 'dayjs'
import { useDate } from '#v/composables/useDate'
import { useApp } from '#v/composables/useApp'
import { TIME_ZONE } from '#v/constants'
import DatePickerInput from '#v/components/date-picker/Input.vue'

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

// 日期显示格式 (用斜杠分隔)
const displayDateFormat = 'YYYY-MM-DD'

// Range 输入
const startDateStrValueInput = useTemplateRef('startDateStrValueInput')
const endDateStrValueInput = useTemplateRef('endDateStrValueInput')
const startDateStrValue = computed<string | undefined>({
  get() {
    return useDate().dateValueToDayjs((calendarValue.value as DateRange)?.start)?.format(displayDateFormat) ?? undefined
  },
  set(newValue) {
    if (!newValue) {
      calendarValue.value = { ...(calendarValue.value as DateRange), start: undefined }
      return
    }
    const formattedDayjs = dayjs(newValue, displayDateFormat, true)
    if (formattedDayjs.isValid()) {
      calendarValue.value = {
        ...(calendarValue.value as DateRange),
        start: useDate().dayjsToDateValue(formattedDayjs)
      }
    }
  }
})
const endDateStrValue = computed<string | undefined>({
  get() {
    return useDate().dateValueToDayjs((calendarValue.value as DateRange)?.end)?.format(displayDateFormat) ?? undefined
  },
  set(newValue) {
    if (!newValue) {
      calendarValue.value = { ...(calendarValue.value as DateRange), end: undefined }
      return
    }
    const formattedDayjs = dayjs(newValue, displayDateFormat, true)
    if (formattedDayjs.isValid()) {
      calendarValue.value = {
        ...(calendarValue.value as DateRange),
        end: useDate().dayjsToDateValue(formattedDayjs)
      }
    }
  }
})

// Single 输入
const singleDateStrValueInput = useTemplateRef('singleDateStrValueInput')
const singleDateStrValue = computed<string | undefined>({
  get() {
    return useDate().dateValueToDayjs(calendarValue.value as DateValue)?.format(displayDateFormat) || undefined
  },
  set(newValue) {
    if (!newValue) {
      calendarValue.value = null
      return
    }
    const formattedDayjs = dayjs(newValue, displayDateFormat, true)
    if (formattedDayjs.isValid()) {
      calendarValue.value = useDate().dayjsToDateValue(formattedDayjs)
    }
  }
})

// Popover 打开/关闭控制
const popoverOpen = ref(false)
const onOpenCalendar = () => {
  popoverOpen.value = true
}
const onCloseCalendar = () => {
  popoverOpen.value = false
}

const focusStartInput = () => {
  nextTick(() => {
    if (isRangeOpr.value) {
      startDateStrValueInput.value?.focus()
    } else {
      singleDateStrValueInput.value?.focus()
    }
  })
}

defineExpose({
  focus: () => {
    focusStartInput()
  }
})

// 日期快捷方式
const date = useDate()
const dateRangeShortcuts: DateShortcut[] = [
  date.lastWeekDateShortcut,
  date.lastMonthDateShortcut,
  date.currentWeekDateShortcut,
  date.currentMonthDateShortcut
]
</script>

<template>
  <UPopover
    v-model:open="popoverOpen"
    :dismissible="false"
    :content="{
      align: 'start',
      onCloseAutoFocus: (e: Event) => e.preventDefault(),
      onOpenAutoFocus: (e: Event) => e.preventDefault()
    }"
  >
    <!-- 输入框直接暴露 -->
    <template v-if="isNoCalendarOpr" />

    <template v-else-if="isRangeOpr">
      <!-- 必须加这个div，不然第一个输入框无法正确渲染 -->
      <div />
      <DatePickerInput
        ref="startDateStrValueInput"
        v-model:value="startDateStrValue"
        icon=""
        input-class="w-32"
        placeholder="YYYY-MM-DD"
        @focus="onOpenCalendar"
        @blur="onCloseCalendar"
      />
      <UBadge variant="outline" color="neutral">
        ~
      </UBadge>
      <DatePickerInput
        ref="endDateStrValueInput"
        v-model:value="endDateStrValue"
        icon=""
        input-class="w-32"
        placeholder="YYYY-MM-DD"
        @focus="onOpenCalendar"
        @blur="onCloseCalendar"
      />
    </template>

    <template v-else>
      <div />
      <DatePickerInput
        ref="singleDateStrValueInput"
        v-model:value="singleDateStrValue"
        icon=""
        input-class="w-32"
        placeholder="YYYY-MM-DD"
        @focus="onOpenCalendar"
        @blur="onCloseCalendar"
      />
    </template>

    <template #content>
      <div
        class="p-3 flex flex-col gap-2"
        @mousedown.prevent
      >
        <UCalendar
          v-if="!isNoCalendarOpr"
          :model-value="calendarValue"
          :range="isRangeOpr"
          size="sm"
          :disabled="disabled"
          :number-of-months="app.isMobile.value || !isRangeOpr ? 1 : 2"
          @update:model-value="(newValue) => calendarValue = newValue ?? null"
        />

        <UFieldGroup class="ml-auto">
          <UButton
            v-for="shortcut in isRangeOpr ? dateRangeShortcuts : []"
            :key="shortcut.label"
            :label="shortcut.label"
            size="xs"
            color="neutral"
            variant="outline"
            :disabled="disabled"
            :tabindex="-1"
            @click="calendarValue = shortcut.dateFn()"
          />
          <UButton
            v-if="!isRangeOpr"
            label="今天"
            size="xs"
            color="neutral"
            variant="outline"
            :tabindex="-1"
            @click="() => {
              calendarValue = now(TIME_ZONE)
            }"
          />
        </UFieldGroup>
      </div>
    </template>
  </UPopover>
</template>
