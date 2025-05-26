<script setup lang="ts">
defineProps<{
  title: string;
  isEmpty: boolean;
  emptyMessage: string;
}>();
</script>

<template>
  <div class="mt-4">
    <h3 class="font-semibold mb-3">{{ title }}</h3>
    <div v-if="!isEmpty" class="space-y-2">
      <slot />
    </div>
    <div v-else class="text-center py-6 text-muted-foreground">
      {{ emptyMessage }}
    </div>
  </div>
</template>
