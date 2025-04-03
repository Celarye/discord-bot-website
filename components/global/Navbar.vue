<template>
  <nav class="bg-gray-800 text-white p-4">
    <div class="container mx-auto flex justify-between items-center">
      <div class="flex items-center space-x-2">
        <h1 class="text-xl font-bold">Discord Bot Manager</h1>
        <StatusIndicator />
      </div>

      <div class="flex space-x-4">
        <NuxtLink to="/" class="hover:text-blue-300">Dashboard</NuxtLink>
        <NuxtLink to="/config" class="hover:text-blue-300">Config</NuxtLink>
        <NuxtLink to="/logs" class="hover:text-blue-300">Logs</NuxtLink>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import StatusIndicator from "./StatusIndicator.vue";
</script>
