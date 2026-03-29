<script setup lang="ts">
const props = defineProps<{
  category: string
}>()

const { data: components } = await useAsyncData(`components-${props.category}`, () => {
  return queryCollection('docs')
    .where('path', 'LIKE', '/docs/components/%')
    .where('extension', '=', 'md')
    .where('category', '=', props.category)
    .select('path', 'title', 'description')
    .all()
})
</script>

<template>
  <UPageGrid class="gap-4">
    <UPageCard
      v-for="component in components"
      :key="component.path"
      :title="component.title"
      :description="component.description"
      :to="component.path"
      :ui="{
        root: 'overflow-hidden group ring-muted',
        body: 'p-4',
        title: 'text-[15px] font-medium',
        description: 'line-clamp-2 mt-0.5'
      }"
    />
  </UPageGrid>
</template>
