<script setup lang="ts">
const mode = ref<'disable' | 'hide'>('disable')
const hasPermission = ref(true)

const toast = useToast()
provide('vui:hasPermissions', (_perms: string | string[]) => hasPermission.value)
</script>

<template>
  <div class="space-y-4">
    <div class="flex gap-4">
      <UFormField label="Mode">
        <USelect v-model="mode" :items="['disable', 'hide']" class="w-32" />
      </UFormField>
      <UFormField label="Has Permission">
        <USwitch v-model="hasPermission" />
      </UFormField>
    </div>
    <ProPermissionWrapper
      permission="admin:write"
      :mode="mode"
      fallback
      @permission-denied="toast.add({
        title: 'Permission Denied',
        description: 'You do not have permission to create a resource.',
        color: 'error'
      })"
    >
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
</template>
