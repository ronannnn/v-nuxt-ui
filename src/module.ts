import { defineNuxtModule, createResolver, addComponentsDir, addImportsDir, addPlugin, installModule } from '@nuxt/kit'

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
    }
  },
  defaults: {
    prefix: 'V'
  },
  async setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    // Ensure @nuxt/ui is installed
    await installModule('@nuxt/ui')

    // Register components (pathPrefix: true uses directory structure for naming)
    // e.g., pro/table/header/index.vue → ProTableHeader
    addComponentsDir({
      path: resolve('./runtime/components'),
      pathPrefix: true
    })

    // Register composables
    addImportsDir(resolve('./runtime/composables'))
    addImportsDir(resolve('./runtime/composables/api'))
    addImportsDir(resolve('./runtime/composables/table'))

    // Register utils
    addImportsDir(resolve('./runtime/utils'))
    addImportsDir(resolve('./runtime/utils/download'))

    // Register constants
    addImportsDir(resolve('./runtime/constants'))

    // Register plugins
    addPlugin(resolve('./runtime/plugins/01.nuxtUIEnhancement'))
    addPlugin(resolve('./runtime/plugins/02.dayjs'))

    // Add CSS
    nuxt.options.css.push(resolve('./runtime/assets/css/main.css'))
    nuxt.options.css.push(resolve('./runtime/assets/css/transition.css'))

    // Add types
    nuxt.hook('prepare:types', ({ references }) => {
      references.push({ path: resolve('./runtime/types/index.ts') })
    })
  }
})
