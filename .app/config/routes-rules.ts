import { isProduction } from 'std-env'

const staticAssetsRule = isProduction
  ? {
    headers: {
      'Cache-Control': 'public, max-age=3600',
    },
  }
  : {}

const staticPageRule = isProduction
  ? {
    prerender: true,
    cache: {
      maxAge: 3600,
      swr: true,
      staleMaxAge: 3600,
    },
    headers: {
      'Cache-Control':
        'public, max-age=3600, s-maxage=3600, stale-while-revalidate=3600, stale-if-error=3600',
    },
  }
  : {}

export const appRules = {
  '/img/**': staticAssetsRule,
  '/shiki/**': staticAssetsRule,
}
