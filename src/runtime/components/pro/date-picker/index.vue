<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'
import type { DateRange, DateValue } from 'reka-ui'
import { now } from '@internationalized/date'
import type { DateShortcut } from '../../../types/components/date'
import dayjs from 'dayjs'

const props = defineProps<{
  size?: ButtonProps['size']
  loading?: ButtonProps['loading']
  range?: boolean
  placeholder?: string
  timeUnit?: Const.Time.TimeUnit
  leadingIcon?: ButtonProps['leadingIcon']
  shortcuts?: DateShortcut[]
  peerButtons?: ButtonProps[]
}>()

const modelValue = defineModel<DateValue | DateValue[] | DateRange | null | undefined>('modelValue', { required: true })

const app = useApp()

// range input
const startDateStrValueInput = useTemplateRef('startDateStrValueInput')
const startDateStrValue = computed<string | undefined>({
  get() {
    return useDate().dateValueToDayjs((modelValue.value as DateRange)?.start)?.format(dateFormat) ?? undefined
  },
  set(newValue) {
    if (!newValue) {
      modelValue.value = {
        ...(modelValue.value as DateRange),
        start: undefined
      }
      return
    }
    const formattedDayjs = dayjs(newValue, dateFormat, true)
    if (formattedDayjs.isValid()) {
      modelValue.value = {
        ...(modelValue.value as DateRange),
        start: useDate().dayjsToDateValue(formattedDayjs) ?? undefined
      }
    }
  }
})
const endDateStrValue = computed<string | undefined>({
  get() {
    return useDate().dateValueToDayjs((modelValue.value as DateRange)?.end)?.format(dateFormat) ?? undefined
  },
  set(newValue) {
    if (!newValue) {
      modelValue.value = {
        ...(modelValue.value as DateRange),
        end: undefined
      }
      return
    }
    const formattedDayjs = dayjs(newValue, dateFormat, true)
    if (formattedDayjs.isValid()) {
      modelValue.value = {
        ...(modelValue.value as DateRange),
        end: useDate().dayjsToDateValue(formattedDayjs) ?? undefined
      }
    }
  }
})

// single input
const singleDateStrValueInput = useTemplateRef('singleDateStrValueInput')
const singleDateStrValue = computed<string | undefined>({
  get() {
    return useDate().dateValueToDayjs(modelValue.value as DateValue)?.format(dateFormat) ?? undefined
  },
  set(newValue) {
    if (!newValue) {
      modelValue.value = undefined
      return
    }
    const formattedDayjs = dayjs(newValue, dateFormat, true)
    if (formattedDayjs.isValid()) {
      modelValue.value = useDate().dayjsToDateValue(formattedDayjs)
    }
  }
})

const isValueEmpty = computed(() => {
  if (props.range) {
    const range = modelValue.value as DateRange
    return !range?.start && !range?.end
  } else {
    return !modelValue.value
  }
})

const displayValue = computed(() => {
  if (isValueEmpty.value) {
    return props.placeholder ?? '请选择日期'
  }
  if (props.range) {
    const dateStrList: (string | null)[] = []
    if (props.timeUnit) {
      dateStrList.push(useDate().formatTimeUnit((modelValue.value as DateRange)?.start, props.timeUnit))
      dateStrList.push(useDate().formatTimeUnit((modelValue.value as DateRange)?.end, props.timeUnit))
    } else {
      dateStrList.push(useDate().dateValueToDayjs((modelValue.value as DateRange)?.start)?.format(dateFormat) ?? null)
      dateStrList.push(useDate().dateValueToDayjs((modelValue.value as DateRange)?.end)?.format(dateFormat) ?? null)
    }
    return stringsJoin(dateStrList, ' - ')
  } else {
    return useDate().dateValueToDayjs(modelValue.value as DateValue)?.format(dateFormat) ?? ''
  }
})

const dateStrInputFocus = () => {
  nextTick(() => {
    if (props.range) {
      startDateStrValueInput.value?.focus()
    } else {
      singleDateStrValueInput.value?.focus()
    }
  })
}
const popoverOpen = ref(false)
defineExpose({
  open: () => {
    popoverOpen.value = true
    dateStrInputFocus()
  }
})
</script>

<template>
  <UPopover
    :open="popoverOpen"
    :content="{ align: 'start' }"
    @update:open="newOpen => {
      popoverOpen = newOpen
      if (newOpen) {
        dateStrInputFocus()
      }
    }"
  >
    <UFieldGroup>
      <UButton
        color="neutral"
        variant="outline"
        :leading-icon="leadingIcon ?? 'i-lucide-calendar'"
        trailing-icon="i-lucide-chevron-down"
        :loading="loading"
        :size="size"
      >
        <div class="flex items-center gap-1">
          <span>{{ displayValue }}</span>
        </div>
      </UButton>
      <UButton v-for="(btnProps, idx) in peerButtons" :key="idx" v-bind="btnProps" />
    </UFieldGroup>

    <template #content>
      <div class="p-3 flex flex-col gap-2">
        <div v-if="range" class="flex flex-col sm:flex-row items-center gap-2">
          <ProDatePickerInput
            ref="startDateStrValueInput"
            v-model:value="startDateStrValue"
            placeholder="YYYY/MM/DD 开始日期"
          />
          <ProDatePickerInput
            ref="endDateStrValueInput"
            v-model:value="endDateStrValue"
            placeholder="YYYY/MM/DD 结束日期"
          />
        </div>
        <ProDatePickerInput
          v-else
          ref="singleDateStrValueInput"
          v-model:value="singleDateStrValue"
          placeholder="YYYY/MM/DD 日期"
        />
        <UCalendar
          :model-value="modelValue"
          :size="size"
          :number-of-months="app.isMobile.value || !range ? 1 : 2"
          :range="range"
          @update:model-value="(newValue) => {
            modelValue = newValue
            if (!range) {
              popoverOpen = false
            }
          }"
        />
        <div class="flex flex-wrap items-center gap-1">
          <UButton
            label="清空"
            size="xs"
            color="neutral"
            variant="outline"
            class="mr-auto"
            @click="() => {
              modelValue = range ? { start: undefined, end: undefined } : null
            }"
          />
          <UButton
            v-for="shortcut in shortcuts"
            :key="shortcut.label"
            :label="shortcut.label"
            size="xs"
            color="neutral"
            variant="outline"
            @click="() => {
              modelValue = shortcut.dateFn?.()
              popoverOpen = false
            }"
          />
          <UButton
            v-if="!range"
            label="今天"
            size="xs"
            color="neutral"
            variant="outline"
            class="ml-auto"
            @click="() => {
              modelValue = now(TIME_ZONE)
              popoverOpen = false
            }"
          />
        </div>
      </div>
    </template>
  </UPopover>
</template>
