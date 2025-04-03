<script setup lang="ts">
import { fetchAvailable } from "assets/modules/api";
import { onMounted, ref } from "vue";

const botStatus = ref<"running" | "stopped">("stopped");
const isLoading = ref(false);

onMounted(async () => {
  await Promise.all([fetchBotStatus(), fetchAvailable()]);
});

async function fetchBotStatus() {
  try {
    const response = await fetch("/api/bot/status");
    const data = await response.json();
    botStatus.value = data.status;
  } catch (error) {
    console.error("Failed to fetch bot status:", error);
  }
}

async function startBot() {
  isLoading.value = true;
  try {
    const response = await fetch("/api/bot/start", { method: "POST" });
    const data = await response.json();
    if (data.success) {
      botStatus.value = "running";
    }
  } catch (error) {
    console.error("Failed to start bot:", error);
  } finally {
    isLoading.value = false;
  }
}

async function stopBot() {
  isLoading.value = true;
  try {
    const response = await fetch("/api/bot/stop", { method: "POST" });
    const data = await response.json();
    if (data.success) {
      botStatus.value = "stopped";
    }
  } catch (error) {
    console.error("Failed to stop bot:", error);
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">Bot Dashboard</h2>

    <div class="bg-white shadow rounded-lg p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-semibold">Bot Status</h3>
        <div
          class="px-3 py-1 rounded-full text-white"
          :class="botStatus === 'running' ? 'bg-green-500' : 'bg-red-500'"
        >
          {{ botStatus === "running" ? "Running" : "Stopped" }}
        </div>
      </div>

      <div class="flex space-x-4">
        <button
          v-if="botStatus === 'stopped'"
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center"
          :disabled="isLoading"
          @click="startBot"
        >
          <span v-if="isLoading" class="mr-2">Starting...</span>
          <span v-else>Start Bot</span>
        </button>

        <button
          v-if="botStatus === 'running'"
          class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center"
          :disabled="isLoading"
          @click="stopBot"
        >
          <span v-if="isLoading" class="mr-2">Stopping...</span>
          <span v-else>Stop Bot</span>
        </button>
      </div>
    </div>
  </div>
</template>
