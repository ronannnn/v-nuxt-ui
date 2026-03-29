<script setup lang="ts">
const selected = ref<string | undefined>(undefined)

const items = [
  { label: '在职', value: 'active', color: 'success' as const },
  { label: '离职', value: 'inactive', color: 'error' as const },
  { label: '实习', value: 'intern', color: 'warning' as const }
]

const chipColor = ref('#3b82f6')
const chipLabel = ref('Tag')
const chipDisabled = ref(false)

const themeSelected = ref(true)
</script>

<template>
  <div class="border border-default rounded-lg p-6 space-y-6">
    <div>
      <h4 class="text-sm font-semibold mb-3">
        ProButtonChip
      </h4>
      <div class="flex flex-wrap gap-4 items-center mb-3">
        <UFormField label="Label">
          <UInput v-model="chipLabel" class="w-28" />
        </UFormField>
        <UFormField label="Color">
          <UInput v-model="chipColor" type="color" class="w-16" />
        </UFormField>
        <USwitch v-model="chipDisabled" label="Disabled" />
      </div>
      <div class="flex gap-2">
        <ProButtonChip
          :label="chipLabel"
          :color="chipColor"
          :disabled="chipDisabled"
          :on-click="() => {}"
        />
        <ProButtonChip label="Success" color="#22c55e" :on-click="() => {}" />
        <ProButtonChip label="Warning" color="#f59e0b" :on-click="() => {}" />
        <ProButtonChip
          label="Disabled"
          color="#ef4444"
          disabled
          :on-click="() => {}"
        />
      </div>
    </div>

    <USeparator />

    <div>
      <h4 class="text-sm font-semibold mb-3">
        ProButtonDropdown
      </h4>
      <p class="text-sm text-muted mb-3">
        Selected: {{ selected ?? 'none' }}
      </p>
      <ProButtonDropdown
        v-model="selected"
        :groups="[{
          id: 'status',
          label: 'Status',
          items: items.map(i => ({ id: String(i.value), label: i.label, value: i.value }))
        }]"
      >
        <UButton variant="outline" color="neutral" trailing-icon="i-lucide-chevron-down">
          {{ items.find(i => i.value === selected)?.label ?? 'Select status...' }}
        </UButton>
      </ProButtonDropdown>
    </div>

    <USeparator />

    <div>
      <h4 class="text-sm font-semibold mb-3">
        ProButtonTheme
      </h4>
      <div class="flex gap-2">
        <ProButtonTheme
          label="Blue"
          chip="blue"
          :selected="themeSelected"
          @click="themeSelected = !themeSelected"
        />
        <ProButtonTheme label="Green" chip="green" :selected="false" />
        <ProButtonTheme label="Red" chip="red" :selected="false" />
        <ProButtonTheme label="Settings" icon="i-lucide-settings" :selected="false" />
      </div>
    </div>
  </div>
</template>
