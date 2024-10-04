<script setup lang="ts">
const route = useRoute()
const app = useAppConfig()

/**
 * Global head configuration
 * @see https://unhead.harlanzw.com/
 * @see https://github.com/unjs/unhead/tree/main
 */
useHead({
  title: route.meta.title as string,
  titleTemplate: (titleChunk) => {
    return titleChunk
      ? `${titleChunk} - ${app.tairo.title}`
      : `${app.tairo.title || 'Forflies Admin Panel'}`
  },
  link: [
    {
      rel: 'icon',
      type: 'image/png',
      href: '/img/favicon.png',
    },
  ],

  meta: [
    {
      name: 'twitter:card',
      content: 'summary_large_image',
    },
    {
      name: 'twitter:site',
      content: '@cssninjaStudio',
    },
    {
      name: 'og:image:type',
      content: 'image/png',
    },
    {
      name: 'og:image:width',
      content: '1200',
    },
    {
      name: 'og:image:height',
      content: '630',
    },
  ],
})
</script>

<template>
  <div>
    <!-- 
      Global app search modal
    -->
    <AppSearch />

    <NuxtLayout>
      <NuxtLoadingIndicator color="var(--color-primary-500)" />
      <SeoKit />
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
