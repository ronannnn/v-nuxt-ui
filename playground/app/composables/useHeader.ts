export function useHeader() {
  const route = useRoute()

  const desktopLinks = computed(() => [{
    label: 'Docs',
    to: '/docs/getting-started',
    active: route.path.startsWith('/docs/')
  }, {
    label: 'Examples',
    to: '/examples/users',
    active: route.path.startsWith('/examples/')
  }])
  
  const mobileLinks = computed(() => [{
    label: 'Get Started',
    icon: 'i-lucide-square-play',
    to: '/docs/getting-started',
    active: route.path.startsWith('/docs/getting-started')
  }, {
    label: 'Components',
    icon: 'i-lucide-square-code',
    to: '/docs/components',
    active: route.path.startsWith('/docs/components')
  }, {
    label: 'Composables',
    icon: 'i-lucide-square-function',
    to: '/docs/composables',
    active: route.path.startsWith('/docs/composables')
  }, {
    label: 'Examples',
    icon: 'i-lucide-panels-top-left',
    to: '/examples/users'
  }])

  return {
    desktopLinks,
    mobileLinks
  }
}
