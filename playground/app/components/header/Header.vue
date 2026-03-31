<script setup lang="ts">
const route = useRoute()
const { desktopLinks } = useHeader()

const isDocsPage = computed(() => route.path.startsWith('/docs/'))
</script>

<template>
  <UHeader
    :ui="{
      root: isDocsPage ? 'h-auto' : '',
      left: 'min-w-0',
      container: isDocsPage ? 'h-[3.5rem]' : ''
    }"
  >
    <template #left>
      <HeaderLogo />
    </template>

    <UNavigationMenu
      :items="desktopLinks"
      variant="link"
      content-orientation="vertical"
    />

    <template #right>
      <UTooltip
        text="Search"
        :kbds="['meta', 'K']"
      >
        <UContentSearchButton />
      </UTooltip>

      <UTooltip
        text="Open on GitHub"
        class="hidden lg:flex"
      >
        <UButton
          color="neutral"
          variant="ghost"
          to="https://github.com/user/v-nuxt-ui"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
        />
      </UTooltip>

      <UColorModeButton />
    </template>

    <template #body>
      <HeaderBody />
    </template>

    <template
      v-if="route.path.startsWith('/docs/')"
      #bottom
    >
      <HeaderBottom />
    </template>
  </UHeader>
</template>
