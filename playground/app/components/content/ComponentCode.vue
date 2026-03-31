<!-- eslint-disable no-useless-escape -->
<script setup lang="ts">
import json5 from 'json5'
import { upperFirst, camelCase, kebabCase } from 'scule'
import { hash } from 'ohash'
import {
  ProEmpty,
  ProSpin,
  ProWatermark,
  ProCircleProgress,
  ProPermissionWrapper,
  ProScrollArea,
  ProDnd,
  ProDeleteModal,
  ProDatePicker,
  ProDatePickerInput,
  ProForm,
  ProSimpleTable,
  ProTable,
  ProTablePage,
  ProButtonDropdown,
  ProButtonTheme,
  ProBadgeCodeModal,
  ProBadgeCodeTooltip
} from '#components'

// Map of component names to their resolved imports
const componentMap: Record<string, any> = {
  ProEmpty,
  ProSpin,
  ProWatermark,
  ProCircleProgress,
  ProPermissionWrapper,
  ProScrollArea,
  ProDnd,
  ProDeleteModal,
  ProDatePicker,
  ProDatePickerInput,
  ProForm,
  ProSimpleTable,
  ProTable,
  ProTablePage,
  ProButtonDropdown,
  ProButtonTheme,
  ProBadgeCodeModal,
  ProBadgeCodeTooltip
}

const props = defineProps<{
  prose?: boolean
  /** Override the slug taken from the route */
  slug?: string
  class?: any
  /** List of props to ignore in selection */
  ignore?: string[]
  /** List of props to hide from code and selection */
  hide?: string[]
  /** List of props to externalize in script setup */
  external?: string[]
  /** The types of the externalized props */
  externalTypes?: string[]
  /** List of props to use with `v-model` */
  model?: string[]
  /** List of items for each prop */
  items?: { [key: string]: string[] }
  props?: { [key: string]: any }
  slots?: { [key: string]: any }
  /**
   * Whether to collapse the code block
   * @defaultValue false
   */
  collapse?: boolean
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
}>()

const route = useRoute()

const camelName = camelCase(props.slug ?? route.path.split('/').pop() ?? '')
// Pro components use the "Pro" prefix
const name = `Pro${upperFirst(camelName)}`

// Resolve component from the explicit import map
const component = componentMap[name]
const hasComponent = !!component

const componentProps = reactive({
  ...Object.fromEntries(Object.entries(props.props || {}).map(([key, value]) => {
    return [key, value]
  }))
})

const componentEvents = reactive({
  ...Object.fromEntries((props.model || []).map(key => [`onUpdate:${key}`, (e: any) => setComponentProp(key, e)])),
  ...(componentProps.modelValue !== undefined ? { [`onUpdate:modelValue`]: (e: any) => setComponentProp('modelValue', e) } : {})
})

function getComponentProp(name: string) {
  return (componentProps as any)[name] ?? undefined
}

function setComponentProp(name: string, value: any) {
  ;(componentProps as any)[name] = value
}

const { data: meta } = await useFetchComponentMeta(name as any)

function mapKeys(obj: object, parentKey = ''): any {
  return Object.entries(obj || {}).flatMap(([key, value]: [string, any]) => {
    if (typeof value === 'object' && !Array.isArray(value)) {
      return mapKeys(value, key)
    }

    const fullKey = parentKey ? `${parentKey}.${key}` : key

    return !props.ignore?.includes(fullKey) && !props.hide?.includes(fullKey) ? fullKey : undefined
  }).filter(Boolean)
}

const options = computed(() => {
  const keys = mapKeys(props.props || {})

  return keys.map((key: string) => {
    const prop = meta.value?.meta?.props?.find((prop: any) => prop.name === key)
    const propItems = (props.items as any)?.[key] || []
    const items = propItems.length
      ? propItems.map((item: any) => ({
          value: item,
          label: String(item),
          chip: key.toLowerCase().endsWith('color') ? { color: item } : undefined
        }))
      : prop?.type === 'boolean' || prop?.type === 'boolean | undefined'
        ? [{ value: true, label: 'true' }, { value: false, label: 'false' }]
        : []

    return {
      name: key,
      label: key,
      type: prop?.type,
      items
    }
  })
})

function buildCode() {
  let code = ''

  if (props.collapse) {
    code += `::code-collapse
`
  }

  code += `\`\`\`vue${props.highlights?.length ? ` {${props.highlights.join('-')}}` : ''}`

  if (props.external?.length) {
    code += `
<script setup lang="ts">
`
    if (props.externalTypes?.length) {
      const removeArrayBrackets = (type: string): string => type.endsWith('[]') ? removeArrayBrackets(type.slice(0, -2)) : type
      const types = props.externalTypes.map(type => removeArrayBrackets(type))
      code += `import type { ${types.join(', ')} } from 'v-nuxt-ui'
`
    }

    for (const [i, key] of props.external.entries()) {
      const value = json5.stringify(componentProps[key], null, 2)?.replace(/,([ |\t\n]+[}|\]])/g, '$1')
      const type = props.externalTypes?.[i] ? `<${props.externalTypes[i]}>` : ''

      code += `const ${key === 'modelValue' ? 'value' : key} = ref${type}(${value})
`
    }
    code += `<\/script>
`
  }

  code += `
<template>
  <${name}`
  for (const [key, value] of Object.entries(componentProps)) {
    if (key === 'modelValue') {
      code += ` v-model="value"`
      continue
    }

    if (props.model?.includes(key)) {
      code += ` v-model:${key}="${key}"`
      continue
    }

    if (value === undefined || value === null || value === '' || props.hide?.includes(key)) {
      continue
    }

    const prop = meta.value?.meta?.props?.find((prop: any) => prop.name === key)
    const propDefault = prop?.default
    const propName = kebabCase(key)

    if (typeof value === 'boolean') {
      if (value && (propDefault === 'true' || propDefault === '`true`' || propDefault === true)) {
        continue
      }
      if (!value && (!propDefault || propDefault === 'false' || propDefault === '`false`' || propDefault === false)) {
        continue
      }

      code += value ? ` ${propName}` : ` :${propName}="false"`
    } else if (typeof value === 'object') {
      const parsedValue = !props.external?.includes(key) ? json5.stringify(value, null, 2).replace(/,([ |\t\n]+[}|\])])/g, '$1') : key

      code += ` :${propName}="${parsedValue}"`
    } else {
      if (propDefault === value) {
        continue
      }

      code += ` ${typeof value === 'number' ? ':' : ''}${propName}="${value}"`
    }
  }

  if (props.slots) {
    code += `>`
    for (const [key, value] of Object.entries(props.slots)) {
      if (key === 'default') {
        code += props.slots.default
      } else {
        code += `
  <template #${key}>
    ${value}
  </template>\n`
      }
    }
    code += (Object.keys(props.slots).length > 1 ? '\n' : '') + `</${name}>`
  } else {
    code += ' />'
  }
  code += `\n</template>
\`\`\`
`

  if (props.collapse) {
    code += `
::`
  }

  return code
}

const code = computed(() => {
  return buildCode()
})

const playgroundUrl = computed(() => {
  const rawMarkdown = buildCode()
  const vueMarkdown = addVueImports(rawMarkdown)
  const match = vueMarkdown.match(/```vue[^\n]*\n([\s\S]*?)\n```/)
  return match?.[1] ? getPlaygroundUrl(match[1].trim()) : null
})

const codeKey = computed(() => `component-code-${name}-${hash(props)}`)

const { data: ast } = useAsyncData(codeKey, async () => {
  return cachedParseMarkdown(code.value)
}, { lazy: import.meta.client, watch: [code] })
</script>

<template>
  <div
    class="my-5"
  >
    <div
      ref="wrapperContainer"
      class="relative group/component"
    >
      <div
        v-if="options.length"
        class="flex flex-wrap items-center gap-2.5 border border-muted border-b-0 relative rounded-t-md px-4 py-2.5 overflow-x-auto"
      >
        <template
          v-for="option in options"
          :key="option.name"
        >
          <UFormField
            :label="option.label"
            size="sm"
            class="inline-flex ring ring-accented rounded-sm"
            :ui="{
              wrapper: 'bg-elevated/50 rounded-l-sm flex border-r border-accented',
              label: 'text-muted px-2 py-1.5',
              container: 'mt-0'
            }"
          >
            <USelect
              v-if="option.items?.length"
              :model-value="getComponentProp(option.name)"
              :items="option.items"
              value-key="value"
              color="neutral"
              variant="soft"
              class="rounded-sm rounded-l-none min-w-12"
              @update:model-value="setComponentProp(option.name, $event)"
            />
            <UInput
              v-else
              :type="option.type?.includes('number') && typeof getComponentProp(option.name) === 'number' ? 'number' : 'text'"
              :model-value="getComponentProp(option.name)"
              color="neutral"
              variant="soft"
              :ui="{ base: 'rounded-sm rounded-l-none min-w-12' }"
              @update:model-value="setComponentProp(option.name, $event)"
            />
          </UFormField>
        </template>
      </div>

      <div
        v-if="hasComponent"
        ref="componentContainer"
        class="flex justify-center border border-b-0 border-muted relative p-4 z-1"
        :class="[!options.length && 'rounded-t-md', props.class, { 'overflow-hidden': props.overflowHidden, 'dark:bg-neutral-950/50': props.elevated }]"
      >
        <component
          :is="component"
          v-bind="{ ...componentProps, ...componentEvents }"
        >
          <template
            v-for="slot in Object.keys(slots || {})"
            :key="slot"
            #[slot]
          >
            <slot
              :name="slot"
              mdc-unwrap="p"
            >
              {{ slots?.[slot] }}
            </slot>
          </template>
        </component>
      </div>

      <div
        v-else
        ref="componentContainer"
        class="flex justify-center border border-b-0 border-muted relative p-4 z-1 rounded-t-md"
      >
        <UAlert
          color="warning"
          icon="i-lucide-triangle-alert"
          :title="`Component '${name}' not found`"
          description="The component could not be resolved. Make sure it is registered."
        />
      </div>

      <ClientOnly>
        <UTooltip
          v-if="playgroundUrl"
          text="Open in playground"
          :content="{ side: 'right' }"
        >
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

    <MDCRenderer
      v-if="ast"
      :body="ast.body"
      :data="ast.data"
      class="[&_pre]:rounded-t-none! [&_div.my-5]:mt-0!"
    />
  </div>
</template>
