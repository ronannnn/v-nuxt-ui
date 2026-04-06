<script setup lang="ts">
import { useDate, useFetching, useSubmitting } from '#v/composables'
import { useCalendarApi } from '#v/composables/api/sys/useCalendarApi'
import { TIME_ZONE, dateFormat, calendarEventTypeOptions } from '#v/constants'
import { CalendarEventType, type Calendar } from '#v/types'
import type { CalendarDate, ZonedDateTime } from '@internationalized/date'
import { endOfMonth, now, startOfMonth } from '@internationalized/date'
import { useToast } from '@nuxt/ui/runtime/composables/useToast.js'
import { ref, computed, watch } from 'vue'

const apiGroup = useCalendarApi()
const dateUtil = useDate()
const toast = useToast()

const panelDate = ref(now(TIME_ZONE))
const calendars = ref<Calendar[]>([])
const calendarTypeMap = computed(() => {
  const map: Record<string, number> = {}
  for (const calendar of calendars.value) {
    map[dateUtil.isoUtcStringToDayjs(calendar.date)!.format(dateFormat)] = calendar.type!
  }
  return map
})

const { fetching, startFetching, endFetching } = useFetching()
const fetchCalendars = async () => {
  const start = startOfMonth(panelDate.value as ZonedDateTime).subtract({ days: 7 })
  const end = endOfMonth(panelDate.value as ZonedDateTime).add({ days: 7 })
  try {
    startFetching()
    const { data } = await apiGroup.list({
      whereQuery: {
        items: [
          {
            field: 'date',
            opr: 'range_gte_lte',
            value: {
              start: start.toAbsoluteString(),
              end: end.toAbsoluteString()
            }
          },
          { field: 'type', opr: 'ne', value: CalendarEventType.NONE }
        ]
      }
    })
    if (data.value.data) {
      mergeCalendars(data.value.data.list)
    }
  } finally {
    endFetching()
  }
}

const mergeCalendars = (newModels: Calendar[]) => {
  const newCalendars = [...calendars.value]
  for (const newModel of newModels) {
    const index = newCalendars.findIndex(m => m.date === newModel.date)
    if (index !== -1) {
      newCalendars[index] = newModel
    } else {
      newCalendars.push(newModel)
    }
  }
  calendars.value = newCalendars.filter(calendar => calendar.type !== CalendarEventType.NONE)
}

// form
const selectedDates = ref<CalendarDate[]>()
const calendarEventType = ref(CalendarEventType.HOLIDAY)
const { submitting, startSubmitting, endSubmitting } = useSubmitting()
const onSubmit = async () => {
  if (selectedDates.value?.length === 0 || calendarEventType.value === undefined) {
    toast.add({
      color: 'warning',
      title: '提交失败',
      description: '请至少选择一个日期并选择节假日类型'
    })
    return
  }
  try {
    startSubmitting()
    const { data } = await apiGroup.batchSave({
      dates: selectedDates.value?.map(date => dateUtil.dateValueToDayjs(date)?.toISOString() ?? '') ?? [],
      type: calendarEventType.value
    })
    if (data.value.data) {
      mergeCalendars(data.value.data.list)
      selectedDates.value = []
    }
  } finally {
    endSubmitting()
  }
}

watch(
  panelDate,
  () => {
    fetchCalendars()
  },
  { immediate: true }
)
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <div class="flex flex-col items-center">
      <UButton
        label="节假日设置"
        size="xl"
        icon="i-lucide-calendar-days"
        variant="link"
        color="primary"
      />
      <div class="text-dimmed text-sm">
        选择一个或多个日期并选择节假日类型，然后点提交
      </div>
    </div>
    <div class="flex flex-col md:flex-row items-center md:items-start gap-3 md:gap-4">
      <UCard class="h-fit w-fit">
        <UCalendar
          v-model="selectedDates"
          multiple
          disable-days-outside-current-view
          :fixed-weeks="false"
          :disabled="fetching || submitting"
          :next-year="{
            onClick: () => {
              panelDate = panelDate.add({ years: 1 })
            }
          }"
          :prev-year="{
            onClick: () => {
              panelDate = panelDate.subtract({ years: 1 })
            }
          }"
          :next-month="{
            onClick: () => {
              panelDate = panelDate.add({ months: 1 })
            }
          }"
          :prev-month="{
            onClick: () => {
              panelDate = panelDate.subtract({ months: 1 })
            }
          }"
        >
          <template #day="{ day }">
            <UChip
              :show="calendarTypeMap[dateUtil.dateValueToDayjs(day)?.format(dateFormat) ?? ''] !== undefined"
              size="2xs"
              :color="(calendarEventTypeOptions.find(item => item.value === calendarTypeMap[dateUtil.dateValueToDayjs(day)?.format(dateFormat) ?? ''])?.color ?? 'primary')"
            >
              {{ day.day }}
            </UChip>
          </template>
        </UCalendar>
      </UCard>
      <UCard class="min-w-64 h-fit">
        <div class="flex flex-col gap-3 sm:gap-4">
          <UFormField label="已选日期" required>
            <div v-if="(selectedDates?.length ?? 0) > 0" class="grid grid-cols-3 gap-1">
              <UBadge
                v-for="(date, i) in selectedDates"
                :key="i"
                variant="subtle"
                :label="dateUtil.dateValueToDayjs(date)?.format(dateFormat) ?? ''"
              >
                <template #trailing>
                  <UIcon
                    name="i-lucide-x"
                    class="cursor-pointer"
                    @click="() => {
                      const newValue = [...(selectedDates ?? [])]
                      newValue.splice(i, 1)
                      selectedDates = newValue
                    }"
                  />
                </template>
              </UBadge>
              <UButton
                label="清除"
                variant="ghost"
                size="xs"
                icon="i-lucide-timer-reset"
                @click="selectedDates = []"
              />
            </div>
            <div v-else>
              /
            </div>
          </UFormField>
          <UFormField label="节假日类型" required>
            <URadioGroup
              v-model="calendarEventType"
              :items="calendarEventTypeOptions"
            >
              <template #label="{ item }">
                <div class="flex items-center gap-2">
                  <span>{{ item.label }}</span>
                  <span
                    v-if="item.value !== CalendarEventType.NONE"
                    class="inline-block size-2 rounded-full"
                    :class="`bg-(--color-light) dark:bg-(--color-dark)`"
                    :style="{
                      '--color-light': `var(--ui-${String(item.color)})`,
                      '--color-dark': `var(--ui-${String(item.color)})`
                    }"
                  />
                </div>
              </template>
            </URadioGroup>
          </UFormField>
        </div>

        <template #footer>
          <div class="flex justify-end">
            <UButton
              label="提交"
              color="primary"
              icon="i-lucide-upload"
              :loading="submitting"
              :disabled="(selectedDates?.length ?? 0) === 0 || calendarEventType === undefined || submitting"
              @click="onSubmit"
            />
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>
