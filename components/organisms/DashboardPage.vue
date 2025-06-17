<script setup lang="ts">
import type { Plugintype } from "@/assets/types/typelist";
import HandledRequestsCounter from "@/components/atoms/HandledRequestsCounter.vue";
import Status from "@/components/molecules/Status.vue";
import DashboardPluginList from "../molecules/DashboardPluginList.vue";

// Status
const botStatus = ref(false);

function toggleBotStatus(newStatus: boolean) {
  botStatus.value = newStatus;
}

function restartBot() {
  console.log("Restarting bot...");

  botStatus.value = false;
  setTimeout(() => {
    botStatus.value = true;
    console.log("Bot restarted.");
  }, 1000);
}

// Count
const count = ref(123456789);

// Configured plugins
const plugins = ref<Plugintype[]>([]);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    const response = await fetch("/api/plugins/config");

    if (!response.ok) {
      throw new Error(`Failed to load config: ${response.statusText}`);
    }

    const yaml = await import("js-yaml");
    const content = await response.text();
    const parsed = yaml.load(content);

    if (
      parsed &&
      typeof parsed === "object" &&
      Array.isArray((parsed as any).plugins)
    ) {
      plugins.value = (parsed as any).plugins;
    }
  } catch (err: any) {
    console.error("Error loading configured plugins:", err);
    error.value = "Failed to load configured plugins.";
  }
});
</script>

<template>
  <div class="flex flex-col md:flex-row justify-around h-window gap-4">
    <div class="flex flex-col gap-4 w-full md:w-1/3">
      <Status
        :bot-status="botStatus"
        @update:bot-status="toggleBotStatus"
        @restart="restartBot"
      />
      <HandledRequestsCounter :count="count" />
    </div>

    <div class="flex-1 border rounded-lg p-4 shadow-md w">
      <div v-if="error" class="text-red-500 mb-2">{{ error }}</div>
      <DashboardPluginList :plugins="plugins" />
    </div>
  </div>
</template>
