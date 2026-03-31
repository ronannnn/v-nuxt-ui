<script setup lang="ts">
const singleDate = ref()
const rangeDate = ref()
const date = useDate()
</script>

<template>
  <div class="space-y-6">
    <div>
      <h4 class="text-sm font-semibold mb-3">
        Single Date
      </h4>
      <ProDatePicker v-model="singleDate" placeholder="Pick a date" />
    </div>
    <div>
      <h4 class="text-sm font-semibold mb-3">
        Date Range
      </h4>
      <ProDatePicker
        v-model="rangeDate"
        range
        placeholder="Pick a range"
        :shortcuts="[
          date.lastMonthDateShortcut,
          date.currentMonthDateShortcut,
          {
            label: '最近30天',
            dateFn: () => date.getRecentDateRange(30)
          }
        ]"
      />
    </div>
  </div>
</template>
