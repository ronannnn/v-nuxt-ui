<script setup lang="ts">
</script>

<template>
  <div class="max-w-4xl">
    <h1 class="text-2xl font-bold mb-2">ProForm Demo</h1>
    <p class="text-muted mb-6">
      The ProForm component provides a declarative form builder with 18+ field types,
      Zod validation, and modal/page templates.
    </p>

    <UCard>
      <template #header>
        <h3 class="font-semibold">Supported Field Types</h3>
      </template>

      <div class="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
        <div v-for="type in [
          'input', 'input-number', 'textarea', 'select',
          'async-select', 'async-object-select', 'async-tree-select',
          'tree-select-transfer', 'checkbox', 'switch', 'radio',
          'date-picker', 'color-picker', 'slider', 'cron',
          'rating', 'code-editor', 'custom'
        ]" :key="type" class="flex items-center gap-2 p-2 rounded border border-default">
          <UIcon name="i-lucide-check" class="text-primary size-4" />
          <span>{{ type }}</span>
        </div>
      </div>
    </UCard>

    <UCard class="mt-6">
      <template #header>
        <h3 class="font-semibold">ProForm Usage</h3>
      </template>
      <pre class="text-sm overflow-x-auto"><code>&lt;ProForm
  :fields="[
    { key: 'name', label: 'Name', type: 'input', required: true },
    { key: 'email', label: 'Email', type: 'input' },
    { key: 'role', label: 'Role', type: 'select', items: roleOptions },
    { key: 'birthday', label: 'Birthday', type: 'date-picker' }
  ]"
  :model="formData"
  @submit="handleSubmit"
/&gt;</code></pre>
    </UCard>

    <UCard class="mt-6">
      <template #header>
        <h3 class="font-semibold">CreateModalFormTemplate</h3>
      </template>
      <p class="text-sm text-muted">
        Use <code>ProFormCreateModalTemplate</code> for quick CRUD modal forms,
        or <code>ProFormCreateModalTemplateWithApi</code> for forms that auto-bind to API composables.
      </p>
    </UCard>
  </div>
</template>
