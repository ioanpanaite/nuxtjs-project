<script setup lang="ts">
const navigation = [
  {
    name: 'Content',
    children: [
      {
        name: 'Frontend Settings',
        icon: 'ph:gauge-duotone',
        to: '/dashboards/frontend',
      },
      {
        name: 'Events Schedule',
        icon: 'eva:clock-fill',
        to: '/dashboards/events',
      },
      {
        name: 'Advertisement',
        icon: 'tabler:ad-circle-filled',
        to: '/dashboards/advertisement',
      },
    ],
  },
  {
    name: 'Users',
    children: [
      {
        name: 'User management',
        icon: 'ph:users-three-duotone',
        to: '/dashboards/users',
      },
    ],
  },
  {
    name: 'Promotion',
    children: [
      {
        name: 'Code management',
        icon: 'codicon:checklist',
        to: '/dashboards/promocode',
      },
    ],
  },
]
</script>

<template>
  <TairoSubsidebar>
    <template #header>
      <TairoSubsidebarHeader />
    </template>

    <TairoSubsidebarMenu :navigation="navigation" />
  </TairoSubsidebar>
</template>
