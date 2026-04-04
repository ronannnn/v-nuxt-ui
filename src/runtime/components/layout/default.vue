<script setup lang="ts">
import { useSidebarMenus, useAuth, useTheme, useApp } from '#v/composables'
import { useRoute } from 'nuxt/app'
import { stringsJoin } from '#v/utils'
import UNavigationMenu from '@nuxt/ui/components/NavigationMenu.vue'
import ScrollArea from '#v/components/ScrollArea.vue'
import LayoutModuleMenu from '#v/components/layout/button/ModuleMenu.vue'
import LayoutThemePicker from '#v/components/layout/button/ThemePicker.vue'
import LayoutUserMenu from '#v/components/layout/button/UserMenu.vue'
import Watermark from '#v/components/Watermark.vue'
import { watch } from 'vue'

const app = useApp()
const theme = useTheme()

const loginUser = useAuth().loginUser

const route = useRoute()
// initialize global sidebar menus (library consumers can set real menus here)
const { sidebarMenus, expandSidebarMenu, breadcrumbs, getBreadcrumbs } = useSidebarMenus()

// 直接在路由变化时同步更新菜单状态
watch(() => route.path, (newPath) => {
  expandSidebarMenu(newPath)
}, { immediate: true })

// 面包屑更新
watch(
  () => [route.fullPath, sidebarMenus.value],
  () => {
    if (route.fullPath) {
      breadcrumbs.value = getBreadcrumbs(route.fullPath as string)
    }
  },
  { immediate: true, deep: true }
)
</script>

<template>
  <div
    class="flex flex-1 h-full"
    :class="[
      theme.sidebarVariant.value === 'inset' && 'bg-neutral-50 dark:bg-neutral-950',
      theme.sidebarSide.value === 'right' && 'flex-row-reverse'
    ]"
  >
    <!-- sidebar -->
    <USidebar
      v-model:open="app.sidebarCollapsed.value"
      :variant="theme.sidebarVariant.value"
      :collapsible="theme.sidebarCollapsible.value"
      :side="theme.sidebarSide.value"
      :ui="{
        body: 'px-0 sm:px-0',
        footer: 'h-(--ui-footer-height)'
      }"
    >
      <template #header="{ state }">
        <LayoutModuleMenu :collapsed="state === 'collapsed'" class="flex-1" />
        <LayoutThemePicker v-if="state !== 'collapsed'" class="ml-auto" />
      </template>

      <template #default="{ state }">
        <ScrollArea>
          <div class="px-4 flex flex-col gap-2">
            <UNavigationMenu
              :items="sidebarMenus"
              :collapsed="state === 'collapsed'"
              trailing-icon="i-lucide-chevron-down"
              orientation="vertical"
              tooltip
              popover
              :ui="{ link: 'px-1.5 overflow-hidden' }"
            />
          </div>
        </ScrollArea>
      </template>

      <template #footer="{ state }">
        <LayoutUserMenu :collapsed="state === 'collapsed'" />
      </template>
    </USidebar>

    <!-- main content -->
    <div
      class="flex-1 flex flex-col w-full overflow-hidden lg:peer-data-[variant=floating]:my-4 peer-data-[variant=inset]:m-4 lg:peer-data-[variant=inset]:not-peer-data-[collapsible=offcanvas]:ms-0 peer-data-[variant=inset]:rounded-xl peer-data-[variant=inset]:shadow-sm peer-data-[variant=inset]:ring peer-data-[variant=inset]:ring-default bg-default"
    >
      <Watermark
        :text="stringsJoin([
          loginUser?.nickname ?? loginUser?.username,
          loginUser?.department?.company?.nickname ?? loginUser?.department?.name
        ], '@')"
      >
        <slot />
      </Watermark>
    </div>
  </div>
</template>
