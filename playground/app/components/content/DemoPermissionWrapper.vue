<script setup lang="ts">
const mode = ref<'disable' | 'hide'>('disable')
const hasPermission = ref(true)
const showFallback = ref(true)

// Provide the permission checker for the demo
provide('vui:hasPermissions', (_perms: string | string[]) => hasPermission.value)
</script>

<template>
  <div class="border border-default rounded-lg p-6 space-y-4">
    <div class="flex flex-wrap gap-4 items-center">
      <UFormField label="Mode">
        <USelect v-model="mode" :items="['disable', 'hide']" class="w-32" />
      </UFormField>
      <USwitch v-model="hasPermission" label="Has Permission" />
      <USwitch v-model="showFallback" label="Show Fallback" />
    </div>

    <USeparator />

    <div class="py-4">
      <ProPermissionWrapper permission="admin:write" :mode="mode" :fallback="showFallback">
        <UButton color="primary" icon="i-lucide-plus">
          Create Resource
        </UButton>
        <template #fallback>
          <UBadge variant="subtle" color="warning" icon="i-lucide-lock">
            No permission to create
          </UBadge>
        </template>
      </ProPermissionWrapper>
    </div>

    <p class="text-xs text-muted">
      Toggle "Has Permission" to see the behavior in each mode. In "disable" mode, clicks are blocked. In "hide" mode, the button is removed entirely.
    </p>
  </div>
</template>
