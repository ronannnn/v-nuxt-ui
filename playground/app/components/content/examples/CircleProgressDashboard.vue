<script setup lang="ts">
</script>

<template>
  <div class="flex justify-center gap-8 py-4">
    <div class="w-24 h-24">
      <ProCircleProgress
        :arcs="[
          { percent: 40, color: 'primary' },
          { percent: 30, color: 'success' },
          { percent: 20, color: 'warning' },
          { percent: 10, color: 'error' }
        ]"
        text="Stats"
      />
    </div>
    <div class="w-24 h-24">
      <ProCircleProgress
        :arcs="[{ percent: 100, color: 'success' }]"
        text="100%"
        text-color="success"
      />
    </div>
    <div class="w-24 h-24">
      <ProCircleProgress
        :arcs="[{ percent: 60, color: 'warning' }, { percent: 40, color: 'neutral' }]"
        text="60%"
        text-color="warning"
      />
    </div>
  </div>
</template>
