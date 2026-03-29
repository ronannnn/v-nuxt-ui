<script setup lang="ts">
const singleDate = ref()
const rangeDate = ref()
</script>

<template>
  <div class="border border-default rounded-lg p-6 space-y-4">
    <div>
      <h4 class="text-sm font-semibold mb-3">
        Single Date
      </h4>
      <ProDatePicker v-model="singleDate" placeholder="Pick a date" />
      <p class="text-xs text-muted mt-2 font-mono">
        Value: {{ singleDate ?? 'null' }}
      </p>
    </div>

    <USeparator />

    <div>
      <h4 class="text-sm font-semibold mb-3">
        Date Range
      </h4>
      <ProDatePicker v-model="rangeDate" range placeholder="Pick a range" />
      <p class="text-xs text-muted mt-2 font-mono">
        Value: {{ rangeDate ?? 'null' }}
      </p>
    </div>

    <USeparator />

    <div>
      <h4 class="text-sm font-semibold mb-3">
        With Shortcuts
      </h4>
      <ProDatePicker
        v-model="singleDate"
        placeholder="With shortcuts"
        :shortcuts="[
          { label: 'Today', dateFn: () => undefined },
          { label: 'Clear', dateFn: () => null }
        ]"
      />
    </div>
  </div>
</template>
