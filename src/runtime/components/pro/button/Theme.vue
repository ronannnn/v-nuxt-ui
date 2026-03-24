<script setup lang="ts">
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
          :class="`bg-(--chip-light) dark:bg-(--chip-dark)`"
          :style="{
            '--chip-light': chip === 'black' ? 'black' : `var(--color-${chip}-500)`,
            '--chip-dark': chip === 'black' ? 'white' : `var(--color-${chip}-400)`
          }"
        />
      </slot>
      <slot v-else-if="locale" name="leading">
        {{ getEmojiFlag(locale) }}
      </slot>
      <slot v-else name="leading" />
    </template>
  </UButton>
</template>
