<script setup lang="ts">
</script>

<template>
  <ProWatermark
    text="Confidential"
    :rotate="-20"
    :opacity="0.5"
    :gap="100"
    :font-size="16"
  >
    <div class="p-8 space-y-4 min-h-48">
      <p class="text-lg font-semibold">
        Custom Styled Watermark
      </p>
      <p class="text-muted">
        This watermark uses custom rotation, opacity, gap and font size.
      </p>
    </div>
  </ProWatermark>
</template>
