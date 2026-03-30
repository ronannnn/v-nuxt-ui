import { defineNuxtModule, createResolver, addComponentsDir, addImportsDir, addPlugin, addTypeTemplate, addTemplate } from '@nuxt/kit'

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

    // Generate a CSS file with @source directive for Tailwind CSS v4 scanning.
    // Without this, Tailwind won't extract class names from our module's runtime
    // files (components, composables, utils). We use addTemplate with absolute
    // paths instead of registering as a Nuxt layer (which would cause component
    // auto-scanning conflicts with our explicit prefix-based registration).
    const runtimeDir = resolve('./runtime')
    addTemplate({
      filename: 'v-nuxt-ui-sources.css',
      write: true,
      getContents: () => `@source "${runtimeDir}/**/*";`,
    })
    nuxt.options.css.unshift('#build/v-nuxt-ui-sources.css')

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

    // Add CSS
    nuxt.options.css.push(resolve('./runtime/assets/css/main.css'))
    nuxt.options.css.push(resolve('./runtime/assets/css/transition.css'))

    // Add types
    nuxt.hook('prepare:types', ({ references }) => {
      references.push({ path: resolve('./runtime/types/index.ts') })
    })

    // Expose types as importable module: import type { VColumn } from '#build/types/v-nuxt-ui'
    addTypeTemplate({
      filename: 'types/v-nuxt-ui.d.ts',
      getContents: () => `export * from '${resolve('./runtime/types/index.ts')}'`
    })
  }
})
