<script setup lang="ts">
const route = useRoute()

const navigation = [
  { label: 'Home', to: '/', icon: 'i-lucide-home' },
  { label: 'Table', to: '/table', icon: 'i-lucide-table-2' },
  { label: 'Form', to: '/form', icon: 'i-lucide-file-text' },
  { label: 'Components', to: '/components', icon: 'i-lucide-box' }
]
</script>

<template>
  <UApp>
    <div class="flex min-h-screen">
      <!-- Sidebar -->
      <aside class="w-60 border-r border-default bg-elevated/50 p-4 flex flex-col gap-2">
        <h1 class="text-lg font-bold px-2 mb-4">V Nuxt UI</h1>
        <UNavigationMenu
          :items="navigation"
          orientation="vertical"
        />
      </aside>

      <!-- Main Content -->
      <main class="flex-1 p-6">
        <NuxtPage />
      </main>
    </div>
  </UApp>
</template>
