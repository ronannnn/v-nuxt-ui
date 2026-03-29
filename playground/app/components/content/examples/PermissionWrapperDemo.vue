<script setup lang="ts">
const mode = ref<'disable' | 'hide'>('disable')
const hasPermission = ref(true)

provide('vui:hasPermissions', (_perms: string | string[]) => hasPermission.value)
</script>

<template>
  <div class="space-y-4">
    <div class="flex gap-4 items-center">
      <UFormField label="Mode">
        <USelect v-model="mode" :items="['disable', 'hide']" class="w-32" />
      </UFormField>
      <USwitch v-model="hasPermission" label="Has Permission" />
    </div>
    <div class="py-4">
      <ProPermissionWrapper permission="admin:write" :mode="mode" fallback>
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
  </div>
</template>
