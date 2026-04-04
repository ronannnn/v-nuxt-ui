<script setup lang="ts">
import { computed } from 'vue'
import { getEmojiFlag } from '#v/utils'
import { useColorMode } from '@vueuse/core'

const props = defineProps<{
  label: string
  icon?: string
  chip?: string
  locale?: string
  selected?: boolean
}>()

const slots = defineSlots<{
  leading: () => any
}>()

const colorMode = useColorMode()
const emojiFlag = computed(() => props.locale ? getEmojiFlag(props.locale) : '')
const chipColor = computed(() => {
  if (!props.chip) return undefined
  if (props.chip === 'black') return 'black'
  const shade = colorMode.value === 'dark' ? '400' : '500'
  return `var(--color-${props.chip}-${shade})`
})
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
          :style="{ backgroundColor: chipColor }"
        />
      </slot>
      <slot v-else-if="locale" name="leading">
        {{ emojiFlag }}
      </slot>
      <slot v-else name="leading" />
    </template>
  </UButton>
</template>
