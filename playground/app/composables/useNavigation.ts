import type { ContentNavigationItem } from '@nuxt/content'
import { findPageChildren, findPageBreadcrumb } from '@nuxt/content/utils'
import { mapContentNavigation } from '@nuxt/ui/utils/content'

const categories = {
  components: [{
    id: 'data',
    title: 'Data',
  }, {
    id: 'form',
    title: 'Form',
  }, {
    id: 'overlay',
    title: 'Overlay',
  }, {
    id: 'layout',
    title: 'Layout',
  }, {
    id: 'element',
    title: 'Element',
  }],
  composables: [{
    id: 'composable',
    title: 'Composables',
  }, {
    id: 'utility',
    title: 'Utilities',
  }],
}

function groupChildrenByCategory(items: ContentNavigationItem[], slug: string): ContentNavigationItem[] {
  if (!items.length) {
    return []
  }

  const groups: ContentNavigationItem[] = []

  const categorized: Record<string, ContentNavigationItem[]> = {}
  const uncategorized: ContentNavigationItem[] = []

  for (const item of items) {
    if (item.category) {
      categorized[item.category as string] = categorized[item.category as string] || []
      categorized[item.category as string]?.push(item)
    }
    else {
      uncategorized.push(item)
    }
  }

  if (uncategorized.length) {
    const withChildren = uncategorized.filter(item => item.children?.length)
      ?.map(item => ({ ...item, children: item.children?.map(child => ({ ...child, icon: undefined })) }))
    const withoutChildren = uncategorized.filter(item => !item.children?.length)

    if (withoutChildren.length) {
      groups.push({
        title: 'Overview',
        path: `/docs/${slug}`,
        children: withoutChildren?.map(item => ({ ...item, icon: undefined })),
      })
    }

    groups.push(...withChildren)
  }

  for (const category of categories[slug as keyof typeof categories] || []) {
    if (categorized[category.id]?.length) {
      groups.push({
        title: category.title,
        path: `/docs/${slug}`,
        children: categorized[category.id],
      })
    }
  }

  return groups
}

export const useNavigation = (navigation: Ref<ContentNavigationItem[] | undefined>) => {
  const rootNavigation = computed(() =>
    navigation.value?.[0]?.children as ContentNavigationItem[] || [],
  )

  const navigationByCategory = computed(() => {
    const route = useRoute()

    const slug = (route.params.slug as string[])?.[0] as string
    const children = findPageChildren(navigation?.value, `/docs/${slug}`, { indexAsChild: true })

    return groupChildrenByCategory(children, slug)
  })

  function findSurround(path: string): [ContentNavigationItem | undefined, ContentNavigationItem | undefined] {
    const flattenNavigation = navigationByCategory.value
      ?.flatMap(item => item?.children) ?? []

    const index = flattenNavigation.findIndex(item => item?.path === path)
    if (index === -1) {
      return [undefined, undefined]
    }

    return [flattenNavigation[index - 1], flattenNavigation[index + 1]]
  }

  function findBreadcrumb(path: string) {
    const breadcrumb = findPageBreadcrumb(navigation?.value, path, { indexAsChild: true })

    return mapContentNavigation(breadcrumb).map(({ icon: _icon, ...link }: any) => link)
  }

  return {
    rootNavigation,
    navigationByCategory,
    findSurround,
    findBreadcrumb,
  }
}
