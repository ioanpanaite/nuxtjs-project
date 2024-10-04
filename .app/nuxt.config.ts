import { isProduction } from 'std-env'
import { appRules } from "./config/routes-rules"

export default defineNuxtConfig({
  ssr: true,
  extends: [
    '../layers/tairo',
    '../layers/tairo-layout-sidebar',
    '../layers/tairo-layout-collapse',
    'nuxt-seo-kit',
  ],
  modules: [
    /**
     * Swiper is a nuxt module that allows us to use swiper in nuxt
     * wich is a carousel component used in the demo
     * @see https://github.com/cpreston321/nuxt-swiper
     */
    'nuxt-swiper',
    '@sidebase/nuxt-auth'
  ],
  auth: {
    isEnabled: true,
    origin: process.env.AUTH_ORIGIN as string,
    globalAppMiddleware: true,
    basePath: '/api/auth',
  },
  css: ['~/assets/css/colors.css'],

  experimental: {
    // using parcel as as watcher run faster
    // when using layers and/or in large projects
    watcher: 'parcel',
    // Write early hints when using node server.
    writeEarlyHints: true,
    // Render JSON payloads with support for revivifying complex types.
    renderJsonPayloads: true,
  },
  routeRules: {
    ...appRules,
  },

  // nuxt behavior configuration
  runtimeConfig: {
    mongodb_uri: process.env.MONGODB_URI,
    stripe_private: process.env.STRIPE_PRIVATE_KEY,
    stripe_public: process.env.STRIPE_PUBLIC_KEY,
    digital_access_key_id: process.env.DIGITAL_ACCESS_KEY_ID,
    digital_secret_access_key: process.env.DIGITAL_SECRET_ACCESS_KEY,
    digital_space_endpoint: process.env.DIGITAL_SPACE_ENDPOINT,
    digital_space_name: process.env.DIGITAL_SPACE_NAME,
    digital_region: process.env.DIGITAL_REGION,
    sendgrid_forgot_pass_email: process.env.SENDGRID_FORGOT_PASS_EMAIL,
    sendgrid_api_key: process.env.SENDGRID_API_KEY,
    public: {
      // mapbox config
      mapboxToken: process.env.NUXT_PUBLIC_MAPBOX_TOKEN,
      // nuxt-seo-kit config
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL,
      siteName: 'Forflies Admin',
      siteDescription: 'Forflies Admin Panel',
      language: 'en',
    },
  },


  // build configuration
  hooks: {
    'vite:extendConfig'(config, { isClient }) {
      if (isProduction && isClient) {
        // @ts-ignore
        config.build.rollupOptions.output.entryFileNames = '_nuxt/e/[hash].js'
        // @ts-ignore
        config.build.rollupOptions.output.chunkFileNames = '_nuxt/c/[hash].js'
        // @ts-ignore
        config.build.rollupOptions.output.assetFileNames =
          '_nuxt/a/[hash][extname]'
      }
    },
  },
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/', '/dashboards', '/users', '/core'],
    },
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
  },
  vite: {
    define: {
      'process.test': false,
      // This is required for shiki to work (used to render markdown code blocks)
      'process.env.VSCODE_TEXTMATE_DEBUG': false,
      // This enables vue-axe to work (used to check a11y - see .demo/plugins/vue-axe.ts)
      'process.env.ENABLE_A11Y_AXE': process.env.ENABLE_A11Y_AXE,
    },
    build: {
      target: 'esnext',
    },
  },

  // nuxt modules configuration
  unfonts: {
    google: {
      families: ['Roboto Flex', 'Inter', 'Karla', 'Fira Code'],
    },
  },
  linkChecker: {
    failOn404: true,
  },
  unhead: {
    seoOptimise: true,
  },
})
