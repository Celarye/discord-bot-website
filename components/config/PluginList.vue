<script setup lang="ts">
import type { Plugintype } from "~/assets/types/typelist";

defineProps<{
  plugins: Plugintype[];
}>();

defineEmits<{
  (e: "deletePlugin", pluginName: string): void;
}>();
</script>

<template>
  <div v-if="plugins.length" class="mt-4">
    <h3 class="font-bold mb-2">Configured Plugins</h3>
    <div class="space-y-2">
      <div
        v-for="plugin in plugins"
        :key="plugin.name"
        class="p-3 bg-blue-100 border rounded flex justify-between items-center"
      >
        <div>
          <p class="font-medium">{{ plugin.name }}</p>
          <p class="text-sm">Version: {{ plugin.version }}</p>
        </div>
        <button
          class="p-1 px-3 bg-red-500 text-white rounded hover:bg-red-600"
          @click="$emit('deletePlugin', plugin.name)"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</template>
