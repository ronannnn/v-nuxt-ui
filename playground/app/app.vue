<script setup lang="ts">
const route = useRoute()

const { data: navigation } = await useAsyncData('navigation', () =>
  queryCollectionNavigation('docs', ['category', 'description']),
)

const { rootNavigation } = useNavigation(navigation)

provide('navigation', rootNavigation)
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator
      color="var(--ui-primary)"
      :height="2"
    />

    <div class="flex">
      <div class="flex-1 min-w-0">
        <template v-if="!route.path.startsWith('/examples')">
          <Header />
        </template>

        <NuxtLayout>
          <NuxtPage />
        </NuxtLayout>
      </div>
    </div>
  </UApp>
</template>
