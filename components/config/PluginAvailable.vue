<script setup lang="ts">
import type { AvailablePlugins } from "~/assets/types/typelist";

defineProps<{
  availablePlugins: AvailablePlugins[];
  selectedVersions: { [key: string]: string };
}>();

defineEmits<{
  (e: "addPlugin", pluginName: string): void;
  (e: "updateVersion", pluginName: string, version: string): void;
}>();
</script>

<template>
  <div>
    <h3 class="font-bold text-lg mb-3">Available Plugins</h3>
    <div class="space-y-3">
      <div
        v-for="plugin in availablePlugins"
        :key="plugin.name"
        class="p-3 bg-gray-100 border rounded"
      >
        <p class="font-medium">{{ plugin.name }}</p>
        <div class="flex items-center my-2">
          <span class="text-sm mr-2">Version:</span>
          <select
            class="border rounded p-1"
            :value="selectedVersions[plugin.name]"
            @change="$emit('updateVersion', plugin.name, $event.target.value)"
          >
            <option
              v-for="version in plugin.versions"
              :key="version"
              :value="version"
            >
              {{ version }}
            </option>
          </select>
        </div>
        <p class="text-sm mb-2">{{ plugin.description }}</p>
        <button
          class="p-1 px-3 bg-green-500 text-white rounded hover:bg-green-600"
          @click="$emit('addPlugin', plugin.name)"
        >
          Add
        </button>
      </div>
    </div>
  </div>
</template>
