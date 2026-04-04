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
    label: '用户列表',
    icon: 'i-lucide-users',
    to: '/examples/users'
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
