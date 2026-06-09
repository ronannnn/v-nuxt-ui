<script setup lang="ts">
import { getEmojiFlag } from '#v/utils'

defineProps<{
  label: string
  icon?: string
  chip?: string
  locale?: string
  selected?: boolean
}>()

const slots = defineSlots<{
  leading: () => any
}>()
</script>

<template>
  <UButton
    size="sm"
    color="neutral"
    variant="outline"
    :icon="icon"
    :label="label"
    class="capitalize ring-default text-[11px]"
    :class="[selected ? 'bg-elevated' : 'hover:bg-elevated/50']"
  >
    <template v-if="chip || locale || !!slots.leading" #leading>
      <slot v-if="chip" name="leading">
        <span
          class="inline-block size-2 rounded-full"
          :class="chip === 'black' ? 'bg-black dark:bg-white' : 'bg-(--chip-color-light) dark:bg-(--chip-color-dark)'"
          :style="chip && chip !== 'black'
            ? {
              '--chip-color-light': `var(--color-${chip}-500)`,
              '--chip-color-dark': `var(--color-${chip}-400)`
            }
            : undefined"
        />
      </slot>
      <slot v-else-if="locale" name="leading">
        {{ getEmojiFlag(locale) }}
      </slot>
      <slot v-else name="leading" />
    </template>
  </UButton>
</template>
