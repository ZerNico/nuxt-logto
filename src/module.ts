import { defineNuxtModule, addPlugin, createResolver, addTemplate, addImports } from '@nuxt/kit'
import { defu } from 'defu'
import { LogtoNuxtModuleConfig } from './runtime/types'

export default defineNuxtModule<LogtoNuxtModuleConfig>({
  meta: {
    name: '@zernico/nuxt-logto',
    configKey: 'logto',
  },
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    const { basePath, appId, origin, ...privateOptions } = options

    // @ts-ignore
    nuxt.options.runtimeConfig.logto = defu(
      nuxt.options.runtimeConfig.logto,
      { ...privateOptions },
      { coookieSecure: true }
    )

    // @ts-ignore
    nuxt.options.runtimeConfig.public.logto = defu(
      nuxt.options.runtimeConfig.public.logto,
      {
        appId: appId,
        basePath: basePath,
        origin: origin,
      },
      { basePath: '/api/logto' }
    )

    addImports([
      {
        name: 'useLogto',
        from: resolve('./runtime/composables/useLogto'),
      },
    ])

    nuxt.hook('nitro:config', (nitroConfig) => {
      nitroConfig.alias = nitroConfig.alias || {}

      // Inline module runtime in Nitro bundle
      nitroConfig.externals = defu(typeof nitroConfig.externals === 'object' ? nitroConfig.externals : {}, {
        inline: [resolve('./runtime')],
      })
      nitroConfig.alias['#logto'] = resolve('./runtime')
    })

    addTemplate({
      filename: 'types/logto.d.ts',
      getContents: () =>
        [
          "declare module '#logto' {",
          `  const LogtoClient: typeof import('${resolve('./runtime/index')}').LogtoClient`,
          '}',
        ].join('\n'),
    })

    nuxt.hook('prepare:types', (options) => {
      options.references.push({ path: resolve(nuxt.options.buildDir, 'types/logto.d.ts') })
    })

    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addPlugin(resolve('./runtime/plugin'))
  },
})
