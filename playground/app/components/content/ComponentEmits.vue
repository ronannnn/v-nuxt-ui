<script setup lang="ts">
import { upperFirst, camelCase, kebabCase } from 'scule'

const props = defineProps<{
  slug?: string
}>()

const route = useRoute()

const camelName = camelCase(props.slug ?? route.path.split('/').pop() ?? '')
const name = `Pro${upperFirst(camelName)}`

const { data: meta } = await useFetchComponentMeta(name as any)
</script>

<template>
  <ProseTable>
    <ProseThead>
      <ProseTr>
        <ProseTh>
          Event
        </ProseTh>
        <ProseTh>
          Type
        </ProseTh>
      </ProseTr>
    </ProseThead>
    <ProseTbody>
      <ProseTr
        v-for="event in (meta?.meta?.events || [])"
        :key="event.name"
      >
        <ProseTd>
          <ProseCode>
            {{ event.name }}
          </ProseCode>
        </ProseTd>
        <ProseTd>
          <HighlightInlineType
            v-if="event.type"
            :type="event.type"
          />

          <MDC
            v-if="event.description"
            :value="event.description"
            class="text-toned mt-1"
            :cache-key="`${kebabCase(route.path)}-${event.name}-description`"
          />
        </ProseTd>
      </ProseTr>
    </ProseTbody>
  </ProseTable>
</template>
