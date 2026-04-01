import { defineNuxtModule, createResolver, addComponentsDir, addImportsDir, addPlugin, addTypeTemplate } from '@nuxt/kit'

export interface ModuleOptions {
  /**
   * Module prefix for components
   * @default 'V'
   */
  prefix?: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'v-nuxt-ui',
    configKey: 'vNuxtUI',
    compatibility: {
      nuxt: '>=4.0.0'
    },
    dependencies: ['@nuxt/ui']
  },
  defaults: {
    prefix: 'V'
  },
  async setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    // Register #runtime alias for cleaner imports within module components
    nuxt.options.alias['#v'] = resolve('./runtime')

    // Register components (pathPrefix: true uses directory structure for naming)
    // e.g., pro/table/header/index.vue → ProTableHeader
    addComponentsDir({
      path: resolve('./runtime/components'),
      prefix: options.prefix,
      pathPrefix: true
    })

    // Register composables
    addImportsDir(resolve('./runtime/composables'))
    addImportsDir(resolve('./runtime/composables/api'))
    addImportsDir(resolve('./runtime/composables/flow'))
    addImportsDir(resolve('./runtime/composables/table'))

    // Register utils
    addImportsDir(resolve('./runtime/utils'))
    addImportsDir(resolve('./runtime/utils/download'))

    // Register constants
    addImportsDir(resolve('./runtime/constants'))

    // Register plugins
    addPlugin(resolve('./runtime/plugins/01.nuxtUIEnhancement'))
    addPlugin(resolve('./runtime/plugins/02.dayjs'))
    addPlugin(resolve('./runtime/plugins/03.theme'))
    addPlugin(resolve('./runtime/plugins/04.head'))

    // Ensure CJS deps are pre-bundled for Vite ESM compat
    nuxt.options.vite ??= {}
    nuxt.options.vite.optimizeDeps ??= {}
    nuxt.options.vite.optimizeDeps.include ??= []
    nuxt.options.vite.optimizeDeps.include.push(
      'dayjs',
      'dayjs/plugin/utc',
      'dayjs/plugin/timezone'
    )

    // Add CSS
    nuxt.options.css.push(resolve('./runtime/assets/css/main.css'))
    nuxt.options.css.push(resolve('./runtime/assets/css/transition.css'))

    // Add types
    nuxt.hook('prepare:types', ({ references }) => {
      references.push({ path: resolve('./runtime/types/index.ts') })
    })

    // Expose types as importable module: import type { VColumn } from 'v-nuxt-ui/types'
    addTypeTemplate({
      filename: 'types/v-nuxt-ui.d.ts',
      getContents: () => `export * from '${resolve('./runtime/types/index.ts')}'`
    })
  }
})
