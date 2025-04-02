<script setup lang="ts">
import { ref, onMounted } from 'vue';

const botStatus = ref<'running' | 'stopped'>('stopped');
const isLoading = ref(false);

// Check bot status on component mount
onMounted(async () => {
  await checkBotStatus();
});

async function checkBotStatus() {
  try {
    const response = await fetch('/api/bot/status');
    const data = await response.json();
    botStatus.value = data.status;
  } catch (error) {
    console.error('Failed to fetch bot status:', error);
  }
}

async function toggleBotStatus() {
  isLoading.value = true;
  try {
    const endpoint = botStatus.value === 'running' ? '/api/bot/stop' : '/api/bot/start';
    const response = await fetch(endpoint, { method: 'POST' });
    const data = await response.json();

    if (data.success) {
      botStatus.value = data.status;
    } else {
      console.error('Failed to toggle bot status:', data.message);
    }
  } catch (error) {
    console.error('Error toggling bot status:', error);
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="flex items-center space-x-2 ml-4">
    <div class="flex items-center">
      <div
          class="w-3 h-3 rounded-full mr-1"
          :class="botStatus === 'running' ? 'bg-green-500' : 'bg-red-500'"
      ></div>
      <span class="text-sm">{{ botStatus === 'running' ? 'Online' : 'Offline' }}</span>
    </div>
    <button
        class="px-2 py-1 text-xs rounded"
        :class="botStatus === 'running'
        ? 'bg-red-500 hover:bg-red-600'
        : 'bg-green-500 hover:bg-green-600'"
        @click="toggleBotStatus"
        :disabled="isLoading"
    >
      {{ isLoading ? 'Loading...' : botStatus === 'running' ? 'Stop' : 'Start' }}
    </button>
  </div>
</template>