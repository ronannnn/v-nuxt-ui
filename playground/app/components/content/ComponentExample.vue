<script setup lang="ts">
import { camelCase, upperFirst } from 'scule'
import { hash } from 'ohash'

const props = withDefaults(defineProps<{
  name: string
  class?: any
  props?: { [key: string]: any }
  /**
   * Whether to collapse the code block
   * @defaultValue false
   */
  collapse?: boolean
  /**
   * Whether to show the preview
   * @defaultValue true
   */
  preview?: boolean
  /**
   * Whether to show the source code
   * @defaultValue true
   */
  source?: boolean
  /**
   * A list of line numbers to highlight in the code block
   */
  highlights?: number[]
  /**
   * Whether to add overflow-hidden to wrapper
   */
  overflowHidden?: boolean
  /**
   * Whether to add background-elevated to wrapper
   */
  elevated?: boolean
  lang?: string
}>(), {
  preview: true,
  source: true,
  lang: 'vue'
})

const camelName = camelCase(props.name)

const exampleModules = import.meta.glob('~/components/content/examples/**/*.vue')
const exampleMatch = Object.entries(exampleModules).find(([path]) => path.endsWith(`/${upperFirst(camelName)}.vue`))
const resolvedComponent = exampleMatch ? defineAsyncComponent(exampleMatch[1] as any) : undefined

const { data } = await useFetchComponentExample(camelName)

const componentProps = reactive({ ...(props.props || {}) })

function buildCodeBlock(source: string, cssClass?: string) {
  const codeFence = `\`\`\`${props.lang}${props.highlights?.length ? ` {${props.highlights.join('-')}}` : ''}
${source}
\`\`\``

  if (props.collapse) {
    return `::code-collapse${cssClass ? `{class="${cssClass}"}` : ''}
${codeFence}
::`
  }

  if (cssClass) {
    return `::div{class="${cssClass}"}
${codeFence}
::`
  }

  return codeFence
}

const code = computed(() => {
  const rawCode = (data.value as any)?.code ?? ''
  return buildCodeBlock(rawCode)
})

const { data: ast } = useAsyncData(`component-example-${camelName}${hash({ props: componentProps, collapse: props.collapse })}`, async () => {
  return cachedParseMarkdown(code.value)
}, { lazy: import.meta.client, watch: [code] })

const playgroundUrl = computed(() => {
  const rawCode = (data.value as any)?.code
  if (!rawCode) return null
  return getPlaygroundUrl(addVueImports(rawCode))
})
</script>

<template>
  <div class="my-5">
    <template v-if="preview">
      <div class="relative group/component">
        <div class="border border-muted relative z-1" :class="[{ 'border-b-0 rounded-t-md': props.source, 'rounded-md': !props.source, 'overflow-hidden': props.overflowHidden }]">
          <div v-if="resolvedComponent" class="flex justify-center p-4" :class="[props.class, { 'dark:bg-neutral-950/50 rounded-t-md': props.elevated }]">
            <component :is="resolvedComponent" v-bind="componentProps" />
          </div>
        </div>

        <ClientOnly>
          <UTooltip v-if="playgroundUrl" text="Open in playground" :content="{ side: 'right' }">
            <UButton
              :to="playgroundUrl"
              target="_blank"
              icon="i-lucide-play"
              color="neutral"
              variant="outline"
              size="sm"
              class="absolute -bottom-3.25 -right-3.25 z-1 rounded-full lg:opacity-0 lg:group-hover/component:opacity-100 ring-muted transition-opacity duration-200"
              aria-label="Open in playground"
            />
          </UTooltip>
        </ClientOnly>
      </div>
    </template>

    <template v-if="props.source">
      <MDCRenderer
        v-if="ast"
        :body="ast.body"
        :data="ast.data"
        class="[&_pre]:rounded-t-none! [&_div.my-5]:mt-0!"
      />
    </template>
  </div>
</template>
