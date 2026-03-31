<script setup lang="ts">
import { isEmptyString } from '#v/utils'

defineProps<{
  label: string
  value?: string | null | undefined
  desc?: string
}>()
</script>

<template>
  <div class="flex flex-col gap-1">
    <!-- label and tooltip -->
    <div class="flex items-center gap-0.5">
      <h2 class="text-sm font-medium text-highlighted">
        {{ label }}
      </h2>
      <UTooltip
        v-if="desc"
        :text="desc"
        :content="{ side: 'top' }"
        :ui="{ text: 'whitespace-pre-line', content: 'h-fit' }"
      >
        <UIcon name="i-lucide-circle-question-mark" />
      </UTooltip>
    </div>
    <!-- value: 可通过具名 slot "value" 自定义渲染，未提供时回退到 props.value -->
    <div class="text-sm text-muted h-full whitespace-pre-wrap">
      <slot>
        {{ isEmptyString(value) ? '/' : value }}
      </slot>
    </div>
  </div>
</template>
