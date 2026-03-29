<script setup lang="ts">
const selected = ref<string | undefined>(undefined)

const groups = [{
  id: 'status',
  label: 'Status',
  items: [
    { id: 'active', label: '在职', value: 'active' },
    { id: 'inactive', label: '离职', value: 'inactive' },
    { id: 'intern', label: '实习', value: 'intern' }
  ]
}]
</script>

<template>
  <div class="space-y-4">
    <p class="text-sm text-muted">
      Selected: {{ selected ?? 'none' }}
    </p>
    <ProButtonDropdown v-model="selected" :groups="groups">
      <UButton variant="outline" color="neutral" trailing-icon="i-lucide-chevron-down">
        {{ groups[0].items.find(i => i.value === selected)?.label ?? 'Select status...' }}
      </UButton>
    </ProButtonDropdown>
  </div>
</template>
