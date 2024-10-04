<script setup lang="ts">
definePageMeta({
  title: 'Dashboard',
  preview: {
    title: 'Dashboard',
    description: 'Dashboard',
    categories: ['dashboards'],
    src: '/img/screens/dashboards-personal-2.png',
    srcDark: '/img/screens/dashboards-personal-2-dark.png',
    order: 2,
  },
})

const { data, pending, error, refresh } = await useFetch('/api/profile')
</script>

<template>
  <div class="mx-auto w-full max-w-5xl">
    <div v-if="!data"></div>
    <div v-else class="relative w-full">
      <div class="flex w-full flex-col">
        <BaseAvatar :src="data?.profile?.picture" size="2xl" class="mx-auto" />
        <div class="mx-auto w-full max-w-md text-center">
          <BaseHeading tag="h2" size="xl" weight="medium" class="mt-4">
            {{ data?.profile?.fullname }}
          </BaseHeading>
          <BaseParagraph size="sm" class="text-muted-400 mb-3 mt-1">
            {{ data?.profile?.email }}
          </BaseParagraph>
        </div>
      </div>

      <div class="ltablet:grid-cols-5 mx-auto mt-6 grid w-full max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
        <BaseCard shape="curved" elevated-hover class="hover:!border-primary-500 group border-2">
          <NuxtLink to="/dashboards/frontend" class="block p-6">
            <div class="text-center">
              <Icon name="ph:buildings-duotone"
                class="group-hover:text-primary-500 text-muted-400 h-8 w-8 transition-all duration-300 group-hover:rotate-6" />
              <BaseHeading tag="h3" size="sm" weight="semibold" class="mt-2 !text-[0.65rem] uppercase">
                Site Content
              </BaseHeading>
              <BaseText size="xs" class="text-muted-400">
                Manage Content
              </BaseText>
            </div>
          </NuxtLink>
        </BaseCard>
        <BaseCard shape="curved" elevated-hover class="hover:!border-primary-500 group border-2">
          <NuxtLink to="/core/administrators" class="block p-6">
            <div class="text-center">
              <Icon name="ph:users-duotone"
                class="group-hover:text-primary-500 text-muted-400 h-8 w-8 transition-all duration-300 group-hover:rotate-6" />
              <BaseHeading tag="h3" size="xs" weight="semibold" class="mt-2 !text-[0.65rem] uppercase">
                Core Users
              </BaseHeading>
              <BaseText size="xs" class="text-muted-400">
                Manage Administrators
              </BaseText>
            </div>
          </NuxtLink>
        </BaseCard>
        <BaseCard shape="curved" elevated-hover class="hover:!border-primary-500 group border-2">
          <NuxtLink to="/dashboards/events" class="block p-6">
            <div class="text-center">
              <Icon name="eva:clock-fill"
                class="group-hover:text-primary-500 text-muted-400 h-8 w-8 transition-all duration-300 group-hover:rotate-6" />
              <BaseHeading tag="h3" size="sm" weight="semibold" class="mt-2 !text-[0.65rem] uppercase">
                Events
              </BaseHeading>
              <BaseText size="xs" class="text-muted-400">
                Manage Events
              </BaseText>
            </div>
          </NuxtLink>
        </BaseCard>
        <BaseCard shape="curved" elevated-hover class="hover:!border-primary-500 group border-2">
          <NuxtLink to="/dashboards/advertisement" class="block p-6">
            <div class="text-center">
              <Icon name="tabler:ad-circle-filled"
                class="group-hover:text-primary-500 text-muted-400 h-8 w-8 transition-all duration-300 group-hover:rotate-6" />
              <BaseHeading tag="h3" size="xs" weight="semibold" class="mt-2 !text-[0.65rem] uppercase">
                Advertisement
              </BaseHeading>
              <BaseText size="xs" class="text-muted-400">
                Manage Advertisement
              </BaseText>
            </div>
          </NuxtLink>
        </BaseCard>
        <BaseCard shape="curved" elevated-hover class="hover:!border-primary-500 group border-2">
          <NuxtLink to="/dashboards/users" class="block p-6">
            <div class="text-center">
              <Icon name="ph:users-four-duotone"
                class="group-hover:text-primary-500 text-muted-400 h-8 w-8 transition-all duration-300 group-hover:rotate-6" />
              <BaseHeading tag="h3" size="sm" weight="semibold" class="mt-2 !text-[0.65rem] uppercase">
                Users
              </BaseHeading>
              <BaseText size="xs" class="text-muted-400">
                Manage Users
              </BaseText>
            </div>
          </NuxtLink>
        </BaseCard>
      </div>
    </div>
  </div>
</template>
