<template>
  <div class="grid gap-6 md:max-w-xl md:grid-cols-2">
    <BaseTextarea
      v-model="value"
      label="Message"
      shape="rounded"
      placeholder="Write a message..."
      rows="1"
      condensed
      autogrow
    />
  </div>
</template>

<script setup lang="ts">
const value = ref('')
</script>
