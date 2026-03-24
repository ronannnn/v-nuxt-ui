<script setup lang="ts">
const features = [
  {
    title: 'ProTable',
    description: 'Sophisticated data table with CRUD, pagination, column management, query filters, Excel export, and more.',
    icon: 'i-lucide-table-2',
    to: '/table'
  },
  {
    title: 'ProForm',
    description: 'Declarative form builder with 18+ field types, Zod validation, and modal/page templates.',
    icon: 'i-lucide-file-text',
    to: '/form'
  },
  {
    title: 'Components',
    description: 'Reusable UI components: DeleteModal, PermissionWrapper, DatePicker, Dnd, and more.',
    icon: 'i-lucide-box',
    to: '/components'
  }
]
</script>

<template>
  <div class="max-w-4xl">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">V Nuxt UI Playground</h1>
      <p class="text-muted text-lg">
        A reusable Nuxt module with enterprise-grade components, composables, and utilities built on top of
        <code class="text-primary">@nuxt/ui</code>.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <UCard v-for="feature in features" :key="feature.title">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon :name="feature.icon" class="text-primary size-5" />
            <h3 class="font-semibold">{{ feature.title }}</h3>
          </div>
        </template>
        <p class="text-sm text-muted">{{ feature.description }}</p>
        <template #footer>
          <UButton :to="feature.to" variant="outline" size="sm">
            View Demo
          </UButton>
        </template>
      </UCard>
    </div>

    <div class="mt-8">
      <h2 class="text-xl font-semibold mb-4">Quick Start</h2>
      <UCard>
        <pre class="text-sm"><code>// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@anthropic-test/v-nuxt-ui']
})</code></pre>
      </UCard>
    </div>
  </div>
</template>
