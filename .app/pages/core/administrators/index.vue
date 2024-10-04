<script setup lang="ts">
definePageMeta({
  title: 'Core Administrators',
  preview: {
    title: 'Core Administrators',
    description: 'For list views and collections',
    categories: ['layouts', 'lists'],
    src: '/img/screens/layouts-list-flex-2.png',
    srcDark: '/img/screens/layouts-list-flex-2-dark.png',
    order: 42,
  },
})

const route = useRoute()
const router = useRouter()
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

const filter = ref('')
const perPage = ref(10)

watch([filter, perPage], () => {
  router.push({
    query: {
      page: undefined,
    },
  })
})

const query = computed(() => {
  return {
    filter: filter.value,
    perPage: perPage.value,
    page: page.value,
  }
})

const handleAdminAdd = async () => {
  router.push(`/core/administrators/admin-create`)
}

const handleEdit = async (id: string) => {
  router.push(`/core/administrators/admin-edit?admin=${id}`)
}

const { data: admin, pending, error, refresh } = await useFetch(
  '/api/admin/all',
  {
    query,
  },
)

function statusColor(itemStatus: string) {
  switch (itemStatus) {
    case 'verified':
    case 'active':
      return 'success'
    case 'working':
      return 'info'
    case 'disabled':
      return 'danger'
    case 'pending':
    case 'new':
    case 'unverified':
      return 'warning'
    default:
      break
  }
}
</script>

<template>
  <div>
    <TairoContentWrapper>
      <template #left>
        <BaseInput v-model="filter" icon="lucide:search" shape="full" placeholder="Filter admins..." :classes="{
          wrapper: 'w-full sm:w-auto',
        }" />
      </template>
      <template #right>
        <BaseButton @click="handleAdminAdd()" color="primary" shape="full" class="w-full sm:w-34">
          <Icon name="lucide:plus" class="h-4 w-4" />
          <span>Add Admin</span>
        </BaseButton>
      </template>
      <div>
        <div v-if="!pending && admin?.data.length === 0">
          <BasePlaceholderPage title="No matching results"
            subtitle="Looks like we couldn't find any matching results for your search terms. Try other search terms.">
            <template #image>
              <img class="block dark:hidden" src="/img/illustrations/placeholders/flat/placeholder-search-4.svg"
                alt="Placeholder image" />
              <img class="hidden dark:block" src="/img/illustrations/placeholders/flat/placeholder-search-4-dark.svg"
                alt="Placeholder image" />
            </template>
          </BasePlaceholderPage>
        </div>
        <div v-else class="pt-6">
          <TransitionGroup enter-active-class="transform-gpu" enter-from-class="opacity-0 -translate-x-full"
            enter-to-class="opacity-100 translate-x-0" leave-active-class="absolute transform-gpu"
            leave-from-class="opacity-100 translate-x-0" leave-to-class="opacity-0 -translate-x-full">
            <FlexTableRow v-for="(item, index) in admin?.data" :key="index" shape="straight" condensed spaced>
              <template #start>
                <FlexTableStart label="admin" :hide-label="index > 0" :title="item.fullname" :subtitle="item.username"
                  :avatar="item.image" :initials="item.initials" />
              </template>
              <template #end>
                <FlexTableCell label="email" :hide-label="index > 0" class="w-full sm:w-80">
                  <span class="text-muted-500 dark:text-muted-400 font-sans text-sm">
                    {{ item.email }}
                  </span>
                </FlexTableCell>
                <FlexTableCell label="status" :hide-label="index > 0" class="w-full sm:w-28">
                  <BaseTag :color="statusColor(item.status)" shape="full" flavor="pastel" condensed class="capitalize">
                    {{ item.status }}
                  </BaseTag>
                </FlexTableCell>
                <FlexTableCell label="action" :hide-label="index > 0">
                  <BaseButtonAction @click="handleEdit(item._id)" color="muted">
                    <span>Edit</span>
                  </BaseButtonAction>
                </FlexTableCell>
              </template>
            </FlexTableRow>
          </TransitionGroup>
        </div>
        <div v-if="!pending && admin?.data.length !== 0" class="mt-4">
          <BasePagination :total-items="admin?.total ?? 0" :item-per-page="perPage" :current-page="page" shape="full" />
        </div>
      </div>
    </TairoContentWrapper>
  </div>
</template>
