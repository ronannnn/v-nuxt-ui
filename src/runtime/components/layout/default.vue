<script setup lang="ts">
import { useApp, useSidebarMenus, useAuth } from '#v/composables'
import { useRoute } from 'nuxt/app'
import { stringsJoin } from '#v/utils'
import UDashboardGroup from '@nuxt/ui/components/DashboardGroup.vue'
import UDashboardSidebar from '@nuxt/ui/components/DashboardSidebar.vue'
import UNavigationMenu from '@nuxt/ui/components/NavigationMenu.vue'
import ScrollArea from '#v/components/ScrollArea.vue'
import LayoutModuleMenu from '#v/components/layout/ModuleMenu.vue'
import LayoutThemePicker from '#v/components/layout/ThemePicker.vue'
import LayoutUserMenu from '#v/components/layout/UserMenu.vue'
import Watermark from '#v/components/Watermark.vue'
import { ref, watch } from 'vue'

const open = ref(false)
const app = useApp()

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
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="sidebar"
      v-model:open="open"
      collapsible
      resizable
      :min-size="app.appConfig.value.siderMinWidth"
      :max-size="app.appConfig.value.siderMaxWidth"
      :ui="{
        root: 'bg-muted min-w-[65px]', // 64 + 1: 1 is border-r
        footer: 'lg:border-t lg:border-default sm:px-4',
        body: 'px-0 sm:px-0',
        header: 'border-b border-default sm:px-4'
      }"
    >
      <template #header="{ collapsed }">
        <LayoutModuleMenu :collapsed="collapsed" class="w-full" />
        <LayoutThemePicker v-if="!collapsed" class="ml-auto" />
      </template>
      <template #default="{ collapsed }">
        <ScrollArea>
          <div class="px-4 flex flex-col gap-2">
            <UNavigationMenu
              :items="sidebarMenus"
              :collapsed="collapsed"
              trailing-icon="i-lucide-chevron-down"
              orientation="vertical"
              tooltip
              popover
            />
          </div>
        </ScrollArea>
      </template>

      <template #footer="{ collapsed }">
        <LayoutUserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <Watermark
      :text="stringsJoin([
        loginUser?.nickname ?? loginUser?.username,
        loginUser?.department?.company?.nickname ?? loginUser?.department?.name
      ], '@')"
    >
      <slot />
    </Watermark>
  </UDashboardGroup>
</template>
