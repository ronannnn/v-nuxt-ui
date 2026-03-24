<script setup lang="ts">
import { codeToHtml } from 'shiki'

const props = withDefaults(defineProps<{
  data: string | Record<string, any> | undefined | null
  lang?: 'json' | 'sql' | 'text'
}>(), {
  lang: 'text'
})

const colorMode = useColorMode()

const codeText = computed(() => {
  if (props.data == null) return ''
  if (typeof props.data === 'string') return props.data
  return JSON.stringify(props.data, null, 2)
})

const highlightedHtml = ref('')

const updateHighlight = async () => {
  const text = codeText.value
  if (!text) {
    highlightedHtml.value = ''
    return
  }

  if (props.lang === 'text') {
    highlightedHtml.value = ''
    return
  }

  try {
    highlightedHtml.value = await codeToHtml(text, {
      lang: props.lang,
      theme: colorMode.value === 'dark' ? 'github-dark' : 'github-light'
    })
  } catch {
    highlightedHtml.value = ''
  }
}

watch([codeText, () => colorMode.value], updateHighlight, { immediate: true })
</script>

<template>
  <UPopover :content="{ side: 'top' }" mode="hover" :open-delay="100">
    <UBadge
      icon="i-lucide-eye"
      color="neutral"
      variant="subtle"
      label="查看"
      class="cursor-pointer"
    />
    <template #content>
      <div class="max-w-2xl max-h-96 overflow-auto p-3 text-xs">
        <template v-if="highlightedHtml">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div v-html="highlightedHtml" />
        </template>
        <pre v-else class="whitespace-pre-line">{{ codeText }}</pre>
      </div>
    </template>
  </UPopover>
</template>
