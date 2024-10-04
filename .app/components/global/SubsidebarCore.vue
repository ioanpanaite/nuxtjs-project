<script setup lang="ts">
const navigation = [
  {
    name: 'Core Administrator',
    children: [
      {
        name: 'Core Administrators',
        icon: 'ph:users-duotone',
        to: '/core/administrators',
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
