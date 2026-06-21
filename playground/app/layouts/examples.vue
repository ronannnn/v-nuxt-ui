<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const userMenuItems: DropdownMenuItem[][] = [
  [
    {
      label: 'Playground 菜单',
      icon: 'i-lucide-flask-conical',
      disabled: true
    }
  ]
]
</script>

<template>
  <ProLayoutDefault :user-menu-items="userMenuItems">
    <slot />
  </ProLayoutDefault>
</template>
