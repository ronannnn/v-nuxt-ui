<script setup lang="ts">
import { useAuth } from '#v/composables'
import type { DropdownMenuItem } from '@nuxt/ui'
import { useRoute } from 'nuxt/app'
import { getEmojiFlag } from '#v/utils'
import { computed } from 'vue'

type UserMenuItems = DropdownMenuItem[] | DropdownMenuItem[][]

const props = defineProps<{
  collapsed?: boolean
  headerMode?: boolean
  items?: UserMenuItems
}>()

const auth = useAuth()
const route = useRoute()

function normalizeItems(items?: UserMenuItems): DropdownMenuItem[][] {
  if (!items?.length) {
    return []
  }

  return Array.isArray(items[0])
    ? items as DropdownMenuItem[][]
    : [items as DropdownMenuItem[]]
}

const items = computed<DropdownMenuItem[][]>(() => (
  [
    [
      {
        type: 'label',
        label: auth.loginUser.value?.nickname,
        icon: 'i-lucide-user-circle'
      }
    ],
    ...normalizeItems(props.items),
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
    :ui="{ content: 'w-(--reka-dropdown-menu-trigger-width) min-w-48' }"
  >
    <UButton
      :label="auth.loginUser.value?.nickname ?? 'Hello'"
      leading-icon="i-lucide-user-circle"
      :trailing-icon="(collapsed || headerMode) ? undefined : 'i-lucide-chevrons-up-down'"
      color="neutral"
      variant="ghost"
      square
      class="data-[state=open]:bg-elevated w-full overflow-hidden"
      :ui="{
        trailingIcon: 'text-dimmed ms-auto'
      }"
    />

    <template #locale-leading="{ item }: { item: DropdownMenuItem }">
      <span>
        {{ getEmojiFlag(item.locale as string) }}
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
