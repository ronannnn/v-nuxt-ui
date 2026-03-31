<script setup lang="ts">
import { setGlobalSidebarMenus } from '#v/composables'
import colors from 'tailwindcss/colors'

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
  }]
})
const { rootNavigation } = useNavigation(navigation)

provide('navigation', rootNavigation)

const appConfig = useAppConfig()
const colorMode = useColorMode()

const color = computed(() => colorMode.value === 'dark' ? (colors as unknown as Record<string, Record<string, string>>)[appConfig.ui.colors.neutral]?.[900] : 'white')
const radius = computed(() => `:root { --ui-radius: ${appConfig.theme.radius}rem; }`)
const blackAsPrimary = computed(() => appConfig.theme.blackAsPrimary ? `:root { --ui-primary: black; } .dark { --ui-primary: white; }` : ':root {}')

useHead({
  title: 'V-Nuxt-UI',
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1 maximum-scale=1.0, user-scalable=no' },
    { key: 'theme-color', name: 'theme-color', content: color }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  style: [
    { innerHTML: radius, id: 'nuxt-ui-radius', tagPriority: -2 },
    { innerHTML: blackAsPrimary, id: 'nuxt-ui-black-as-primary', tagPriority: -2 }
  ]
})
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator
      color="var(--ui-primary)"
      :height="2"
    />

    <div class="flex">
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
