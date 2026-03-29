<script setup lang="ts">
import { upperFirst, camelCase, kebabCase } from 'scule'

const props = withDefaults(defineProps<{
  slug?: string
  ignore?: string[]
}>(), {
  ignore: () => []
})

const route = useRoute()

const camelName = camelCase(props.slug ?? route.path.split('/').pop() ?? '')
const componentName = `Pro${upperFirst(camelName)}`

const { data: meta } = await useFetchComponentMeta(componentName as any)

const metaProps = computed(() => {
  if (!meta.value?.meta?.props?.length) {
    return []
  }

  return meta.value.meta.props.filter((prop: any) => {
    return !props.ignore?.includes(prop.name)
  }).map((prop: any) => {
    // Process default values
    if (prop.default) {
      prop.default = prop.default.replace(' as never', '').replace(/^"(.*)"$/, '\'$1\'')
    } else {
      const tag = prop.tags?.find((tag: any) => tag.name === 'defaultValue')?.text
      if (tag) {
        prop.default = tag
      }
    }

    // Expand enum types from schema
    if (prop.schema?.kind === 'enum' && !prop.type.startsWith('boolean') && Object.keys(prop.schema.schema || {}).length) {
      prop.type = Object.values(prop.schema.schema).map((schema: any) => schema?.type ? schema.type : schema).join(' | ')
    }

    return prop
  }).sort((a: any, b: any) => {
    if (a.name === 'as') return -1
    if (b.name === 'as') return 1
    if (a.name === 'ui') return 1
    if (b.name === 'ui') return -1
    return 0
  })
})
</script>

<template>
  <ProseTable>
    <ProseThead>
      <ProseTr>
        <ProseTh>
          Prop
        </ProseTh>
        <ProseTh>
          Default
        </ProseTh>
        <ProseTh>
          Type
        </ProseTh>
      </ProseTr>
    </ProseThead>
    <ProseTbody>
      <ProseTr v-for="prop in metaProps" :key="prop.name">
        <ProseTd>
          <ProseCode>
            {{ prop.name }}
          </ProseCode>
        </ProseTd>
        <ProseTd>
          <HighlightInlineType v-if="prop.default" :type="prop.default" />
        </ProseTd>
        <ProseTd>
          <HighlightInlineType v-if="prop.type" :type="prop.type" />

          <MDC
            v-if="prop.description"
            :value="prop.description"
            class="text-toned mt-1"
            :cache-key="`${kebabCase(route.path)}-${prop.name}-description`"
          />
        </ProseTd>
      </ProseTr>
    </ProseTbody>
  </ProseTable>
</template>
