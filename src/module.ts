import { defineNuxtModule, createResolver, addComponentsDir, addImportsDir, addPlugin, addTypeTemplate } from '@nuxt/kit'
import { defu } from 'defu'

export interface ModuleOptions {
  /**
   * Module prefix for components
   * @default 'V'
   */
  prefix?: string
}

// Default Nuxt UI theme configuration provided by v-nuxt-ui.
// Consumers can override any of these in their own app.config.ts.
const defaultUIConfig = {
  colors: {
    primary: 'sky',
    neutral: 'zinc'
  },
  modal: {
    slots: {
      footer: 'justify-end'
    }
  },
  collapsible: {
    slots: {
      content: 'data-[state=open]:animate-[collapsible-down_300ms_ease-in-out] data-[state=closed]:animate-[collapsible-up_300ms_ease-in-out]'
    }
  },
  button: {
    slots: {
      base: 'cursor-pointer'
    }
  },
  navigationMenu: {
    variants: {
      orientation: {
        vertical: {
          link: 'py-2.5'
        }
      }
    }
  }
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

    // Inject default Nuxt UI theme config into appConfig.
    // defu merges with "defaults last" semantics, so the consumer's
    // app.config.ts values always take priority over our defaults.
    nuxt.options.appConfig.ui = defu(
      nuxt.options.appConfig.ui as Record<string, unknown> || {},
      defaultUIConfig
    )

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
