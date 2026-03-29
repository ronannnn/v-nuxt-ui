<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const route = useRoute()
const { mobileLinks } = useHeader()

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')
const { navigationByCategory } = useNavigation(ref(navigation?.value ? [{ title: 'docs', path: '/docs', children: navigation.value }] : []))
</script>

<template>
  <UNavigationMenu orientation="vertical" :items="mobileLinks" class="-mx-2.5" />

  <template v-if="route.path.startsWith('/docs/')">
    <USeparator type="dashed" class="mt-4 mb-6" />

    <UContentNavigation
      :navigation="navigationByCategory"
      highlight
      :ui="{ linkTrailingBadge: 'font-semibold uppercase' }"
    />
  </template>
</template>
