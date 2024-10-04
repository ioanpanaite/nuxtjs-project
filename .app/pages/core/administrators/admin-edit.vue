<script setup lang="ts">
definePageMeta({
  title: 'Admin Profile Management',
  preview: {
    title: 'Admin Profile Management',
    description: 'For editing a admin profile',
    categories: ['layouts', 'profile', 'forms'],
    src: '/img/screens/layouts-subpages-profile-edit-1.png',
    srcDark: '/img/screens/layouts-subpages-profile-edit-1-dark.png',
    order: 76,
  },
})

const toaster = useToaster()
const router = useRouter()
const route = useRoute()
const query = computed(() => {
  return {
    id: route.query.admin
  }
})

const { data, pending, error, refresh } = await useFetch(`/api/admin/id`, { query })
if (!route.query.admin || !data?.value) {
  toaster.clearAll()
  toaster.show({
    title: 'Oops!',
    message: "Invalid url requested.",
    color: 'danger',
    icon: 'lucide:alert-triangle',
    closable: true,
  })
  router.push('/core/administrators')
}

const generalUrl = `/core/administrators/admin-edit?admin=${route.query.admin}`

</script>

<template>
  <div class="min-h-screen overflow-hidden">
    <div class="grid gap-8 sm:grid-cols-12">
      <div class="col-span-12 sm:col-span-4">
        <div v-if="!pending && data" class="flex w-full items-center gap-2">
          <BaseAvatar :src="data?.image" size="md" />
          <div class="">
            <BaseHeading tag="h2" size="md" weight="medium" lead="none">
              {{ data?.fullname }}
              {{ data?.username }}
            </BaseHeading>
          </div>
        </div>
        <div class="mt-8 max-w-[240px]">
          <ul class="space-y-1 font-sans text-sm">
            <li>
              <NuxtLink :to="generalUrl" exact-active-class="!text-primary-500 !bg-primary-500/10"
                class="text-muted-400 hover:text-muted-600 dark:hover:text-muted-200 hover:bg-muted-50 dark:hover:bg-muted-700/50 flex items-center gap-2 rounded-lg p-3 transition-colors duration-300">
                <Icon name="ph:user-duotone" class="h-4 w-4" />
                <span>General</span>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
      <div class="col-span-12 sm:col-span-8">
        <RouterView v-slot="{ Component }">
          <Transition enter-active-class="transition-all duration-500 ease-out"
            enter-from-class="translate-y-20 opacity-0" enter-to-class="translate-y-0 opacity-100"
            leave-active-class="transition-all duration-200 ease-in" leave-from-class="translate-y-0 opacity-100"
            leave-to-class="translate-y-20 opacity-0">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </div>
    </div>
  </div>
</template>
