<script setup lang="ts">
import { kebabCase } from 'scule'
import type { ContentNavigationItem } from '@nuxt/content'

const route = useRoute()

definePageMeta({
  layout: 'docs'
})

const { data: page } = await useAsyncData(kebabCase(route.path), () => queryCollection('docs').path(route.path).first())
if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

const { findSurround, findBreadcrumb } = useNavigation(ref(navigation?.value ? [{ title: 'docs', path: '/docs', children: navigation.value }] : []))

const breadcrumb = computed(() => findBreadcrumb(page.value?.path as string))
const surround = computed(() => findSurround(page.value?.path as string))

const title = page.value?.title
const description = page.value?.description

useSeoMeta({
  titleTemplate: '%s - V Nuxt UI',
  title,
  ogTitle: `${title} - V Nuxt UI`,
  description,
  ogDescription: description
})
</script>

<template>
  <UPage v-if="page">
    <UPageHeader>
      <template #headline>
        <UBreadcrumb :items="breadcrumb" />
      </template>

      <template #title>
        {{ page.title }}

        <UBadge
          v-if="(page as any).navigation?.badge"
          :label="(page as any).navigation?.badge"
          variant="subtle"
          size="lg"
          class="rounded-full align-middle"
        />
      </template>

      <template #description>
        <MDC
          v-if="page.description"
          :value="page.description"
          unwrap="p"
          :cache-key="`${kebabCase(route.path)}-description`"
        />
      </template>

      <template v-if="page.links?.length" #links>
        <UButton
          v-for="link in page.links"
          :key="link.label"
          color="neutral"
          variant="outline"
          :target="link.to?.startsWith('http') ? '_blank' : undefined"
          v-bind="link"
        />
      </template>
    </UPageHeader>

    <UPageBody>
      <ContentRenderer v-if="page.body" :value="page" />

      <USeparator v-if="surround?.filter(Boolean).length" />

      <UContentSurround :surround="(surround as any)" />
    </UPageBody>

    <template v-if="page?.body?.toc?.links?.length" #right>
      <UContentToc :links="page.body.toc.links">
        <template #bottom>
          <USeparator v-if="page.body?.toc?.links?.length" type="dashed" />

          <UPageLinks
            :links="[{
              icon: 'i-lucide-file-pen',
              label: 'Edit this page',
              to: `https://github.com/user/v-nuxt-ui/edit/main/playground/content/${page?.stem}.md`,
              target: '_blank'
            }]"
          />
        </template>
      </UContentToc>
    </template>
  </UPage>
</template>
