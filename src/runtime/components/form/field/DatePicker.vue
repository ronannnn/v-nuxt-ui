<script setup lang="ts" generic="T">
import { ref, computed, useTemplateRef, nextTick } from 'vue'
import type { ButtonProps } from '@nuxt/ui'
import type { DateValue } from 'reka-ui'
import dayjs from 'dayjs'
import { useDate } from '#v/composables/useDate'
import { dateFormat } from '#v/constants/time'
import DatePickerInput from '#v/components/date-picker/Input.vue'

defineProps<{
  disabled?: boolean
  peerButtons?: ButtonProps[]
}>()

const modelValue = defineModel<string | null | undefined>('modelValue', { required: true })

const open = ref(false)

// ISO UTC String <-> DateValue
const dateValue = computed<DateValue | undefined | null>({
  get() {
    return useDate().isoUtcStringToDateValue(modelValue.value)
  },
  set(newVal) {
    modelValue.value = useDate().dateValueToDayjs(newVal)?.toISOString()
  }
})
// DateValue <-> YYYY/MM/DD
const dateStrValue = computed<string | undefined>({
  get() {
    return useDate().dateValueToDayjs(dateValue.value)?.format(dateFormat) ?? undefined
  },
  set(newValue) {
    if (!newValue) {
      dateValue.value = undefined
      return
    }
    const formattedDayjs = dayjs(newValue, dateFormat, true)
    if (formattedDayjs.isValid()) {
      dateValue.value = useDate().dayjsToDateValue(formattedDayjs)
    }
  }
})
const dateStrValueInput = useTemplateRef('dateStrValueInput')
const dateStrInputFocus = () => {
  nextTick(() => {
    dateStrValueInput.value?.focus()
  })
}
</script>

<template>
  <UFieldGroup class="w-full">
    <UPopover
      :open="open"
      :content="{ align: 'start' }"
      @update:open="newOpen => {
        open = newOpen
        if (newOpen) {
          dateStrInputFocus()
        }
      }"
    >
      <UButton
        :label="dateStrValue ?? ''"
        color="neutral"
        variant="outline"
        leading-icon="i-lucide-calendar"
        trailing-icon="i-lucide-chevron-down"
        :disabled="disabled"
        block
        :ui="{
          leadingIcon: 'text-dimmed',
          trailingIcon: 'text-dimmed'
        }"
      />
      <template #content>
        <div class="p-3 flex flex-col gap-2">
          <DatePickerInput
            ref="dateStrValueInput"
            v-model:value="dateStrValue"
            placeholder="YYYY/MM/DD 日期"
          />
          <UCalendar
            :model-value="dateValue"
            size="sm"
            @update:model-value="(newValue) => {
              dateValue = newValue as DateValue | undefined | null
              open = false
            }"
          />
        </div>
      </template>
    </UPopover>
    <UButton v-for="(btnProps, idx) in peerButtons" :key="idx" v-bind="btnProps" />
  </UFieldGroup>
</template>
