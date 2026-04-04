<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { ref, computed } from 'vue'

defineProps<{
  collapsed?: boolean
}>()

const teams = ref([{
  label: '维科技术',
  avatar: {
    src: '/img/logo.png',
    alt: '维科技术'
  }
}])
const selectedModule = ref(teams.value[0])

const items = computed<DropdownMenuItem[][]>(() => {
  return [teams.value.map(team => ({
    ...team,
    onSelect() {
      selectedModule.value = team
    }
  })), [{
    label: '新增模块',
    icon: 'i-lucide-circle-plus',
    disabled: true
  }, {
    label: '管理模块',
    icon: 'i-lucide-cog',
    disabled: true
  }]]
})
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-40' : 'w-(--reka-dropdown-menu-trigger-width)' }"
  >
    <UButton
      v-bind="{
        ...selectedModule,
        label: collapsed ? undefined : selectedModule?.label
      }"
      color="neutral"
      variant="ghost"
      square
      class="data-[state=open]:bg-elevated"
    />
  </UDropdownMenu>
</template>
