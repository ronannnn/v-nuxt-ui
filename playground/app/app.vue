<script setup lang="ts">
import { setGlobalSidebarMenus } from '#v/composables'

const route = useRoute()

const { data: navigation } = await useAsyncData('navigation', () =>
  queryCollectionNavigation('docs', ['category', 'description'])
)
setGlobalSidebarMenus({
  bizMenus: [{
    label: '文档首页',
    icon: 'i-lucide-home',
    to: '/docs/getting-started'
  }, {
    label: '菜单列表',
    icon: 'i-lucide-list',
    to: '/examples/menus'
  }, {
    label: '角色列表',
    icon: 'i-lucide-user-cog',
    to: '/examples/roles'
  }, {
    label: '用户列表',
    icon: 'i-lucide-users',
    to: '/examples/users'
  }, {
    label: 'Table 系统配置',
    icon: 'i-lucide-table',
    to: '/examples/table-sys'
  }, {
    label: '用户 Table 设置',
    icon: 'i-lucide-settings-2',
    to: '/examples/table-user-settings'
  }, {
    label: '流程图',
    icon: 'i-lucide-workflow',
    to: '/examples/flow'
  }, {
    label: '流程列表',
    icon: 'i-lucide-git-branch-plus',
    to: '/examples/flows'
  }, {
    label: '登录界面',
    icon: 'i-lucide-compass',
    to: '/login/pwd'
  }]
})
const { rootNavigation } = useNavigation(navigation)

provide('navigation', rootNavigation)

useHead({
  title: 'V-Nuxt-UI',
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1 maximum-scale=1.0, user-scalable=no' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ]
})
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator
      color="var(--ui-primary)"
      :height="2"
    />

    <div class="flex h-full">
      <div class="flex-1 min-w-0">
        <template v-if="!route.path.startsWith('/examples')">
          <Header />
        </template>

        <NuxtLayout>
          <NuxtPage />
        </NuxtLayout>
      </div>
    </div>
  </UApp>
</template>
