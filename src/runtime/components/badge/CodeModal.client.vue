<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useClipboard, useColorMode } from '@vueuse/core'
import { codeToHtml } from 'shiki'

const props = withDefaults(defineProps<{
  data: string | Record<string, any> | undefined | null
  lang?: 'json' | 'sql' | 'text'
  title?: string
}>(), {
  lang: 'text',
  title: '查看'
})

const open = ref(false)
const colorMode = useColorMode()
const { copy, copied } = useClipboard()

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
  <UModal v-model:open="open" :title="title">
    <UBadge
      icon="i-lucide-expand"
      color="neutral"
      variant="subtle"
      label="查看"
      class="cursor-pointer"
      @click="open = true"
    />
    <template #body>
      <div class="overflow-hidden text-sm">
        <template v-if="highlightedHtml">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div class="overflow-auto" v-html="highlightedHtml" />
        </template>
        <pre v-else class="whitespace-pre-wrap">{{ codeText }}</pre>
      </div>
    </template>
    <template #footer="{ close }">
      <UButton
        icon="i-lucide-x"
        label="关闭"
        color="neutral"
        variant="outline"
        @click="close"
      />
      <UButton
        :icon="copied ? 'i-lucide-copy-check' : 'i-lucide-copy'"
        label="复制"
        color="neutral"
        variant="outline"
        @click="copy(codeText)"
      />
    </template>
  </UModal>
</template>
