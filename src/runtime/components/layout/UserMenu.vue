<script setup lang="ts">
import { useAuth, useApp } from '#v/composables'
import type { DropdownMenuItem } from '@nuxt/ui'
import { useRoute } from 'vue-router'
import { getEmojiFlag } from '#v/utils'

defineProps<{
  collapsed?: boolean
  headerMode?: boolean
}>()

const auth = useAuth()
const app = useApp()
const route = useRoute()

const items = computed<DropdownMenuItem[][]>(() => (
  [
    [
      {
        type: 'label',
        label: auth.loginUser.value?.nickname,
        icon: 'i-lucide-user-circle'
      }
    ],
    [
      {
        label: '个人资料',
        icon: 'i-lucide-user',
        disabled: true
      },
      {
        label: '设置',
        icon: 'i-lucide-settings',
        to: '/settings/theme'
      }
    ],
    [
      {
        label: '退出登录',
        icon: 'i-lucide-log-out',
        onSelect: () => auth.logout(route)
      }
    ]
  ]
))
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: (collapsed || headerMode) ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }"
  >
    <UButton
      :label="(collapsed || (headerMode && app.isMobile.value))? undefined : auth.loginUser.value?.nickname ?? 'Hello'"
      leading-icon="i-lucide-user-circle"
      :trailing-icon="(collapsed || headerMode) ? undefined : 'i-lucide-chevrons-up-down'"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed || headerMode"
      class="data-[state=open]:bg-elevated"
      :ui="{
        trailingIcon: 'text-dimmed'
      }"
    />

    <template #locale-leading="{ item }: { item: DropdownMenuItem }">
      <span>
        {{ getEmojiFlag(item.locale) }}
      </span>
    </template>
    <template #chip-leading="{ item }: { item: DropdownMenuItem }">
      <span
        :style="{
          '--chip-light': item.chip === 'black' ? 'black' : `var(--color-${item.chip}-500)`,
          '--chip-dark': item.chip === 'black' ? 'white' : `var(--color-${item.chip}-400)`
        }"
        class="ms-0.5 size-2 rounded-full bg-(--chip-light) dark:bg-(--chip-dark)"
      />
    </template>
  </UDropdownMenu>
</template>
