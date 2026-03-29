<script setup lang="ts">
import json5 from 'json5'
import { camelCase } from 'scule'
import { hash } from 'ohash'

const props = defineProps<{
  slug?: string
}>()

const route = useRoute()

const name = props.slug ?? route.path.split('/').pop() ?? ''
const camelName = camelCase(name)

const { data: meta } = await useFetchComponentMeta(`Pro${camelName.charAt(0).toUpperCase() + camelName.slice(1)}` as any)

const themeConfig = computed(() => {
  if (!meta.value?.meta) return null

  const config: Record<string, any> = {}

  // Build a simplified theme overview from component meta
  if (meta.value.meta.props?.length) {
    const propsWithDefaults = meta.value.meta.props.filter((p: any) => p.default)
    if (propsWithDefaults.length) {
      config.defaults = Object.fromEntries(
        propsWithDefaults.map((p: any) => [p.name, p.default])
      )
    }
  }

  return config
})

const { data: ast } = useAsyncData(`component-theme-${camelName}-${hash({ props })}`, async () => {
  if (!themeConfig.value) return null

  const md = `
\`\`\`ts [app.config.ts]
export default defineAppConfig({
  vNuxtUI: ${json5.stringify(themeConfig.value, null, 2).replace(/,([ |\t\n]+[}|\])])/g, '$1')}
})
\`\`\`
`
  return cachedParseMarkdown(md)
}, { lazy: import.meta.client, watch: [themeConfig] })
</script>

<template>
  <MDCRenderer
    v-if="ast"
    :body="ast.body"
    :data="ast.data"
  />
</template>
