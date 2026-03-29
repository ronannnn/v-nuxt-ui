<script setup lang="ts">
</script>

<template>
  <ProWatermark :text="['Company Name', 'user@example.com']" :opacity="0.5">
    <div class="p-8 space-y-4 min-h-48">
      <p class="text-lg font-semibold">
        Multi-line Watermark Demo
      </p>
      <p class="text-muted">
        The watermark supports multiple text lines. Each line is rendered separately with proper spacing.
      </p>
    </div>
  </ProWatermark>
</template>
