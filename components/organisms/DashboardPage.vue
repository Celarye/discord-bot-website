<script setup lang="ts">
import type { Plugintype } from "@/assets/types/typelist";
import HandledRequestsCounter from "@/components/atoms/HandledRequestsCounter.vue";
import Status from "@/components/molecules/Status.vue";
import DashboardPluginList from "../molecules/DashboardPluginList.vue";

// Initialize as false first
const botStatus = ref(false);

// Then check the status
fetch("http://localhost:8080/")
  .then(() => {
    botStatus.value = true;
  })
  .catch(() => {
    botStatus.value = false;
  });

function toggleBotStatus(newStatus: boolean) {
  if (newStatus) {
    fetch("/api/dashboard/start")
      .then()
      .catch(() => (newStatus = false));
  } else {
    fetch("http://localhost:8080/stop");
  }
  botStatus.value = newStatus;
}

function restartBot() {
  fetch("http://localhost:8080/restart");

  botStatus.value = false;
  setTimeout(() => {
    botStatus.value = true;
    fetch("http://localhost:8080/").then(() => (botStatus.value = true));
  }, 3000);
}

// Count
const count = ref(0);
fetch("http://localhost:8080/handled-requests")
  .then((r) => r.text()) // Parse as text first
  .then((text) => {
    count.value = parseInt(text, 10); // Convert string to number
  })
  .catch(() => {
    count.value = 0;
  });

const plugins = ref<Plugintype[]>([]);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    const response = await fetch("/api/plugins/config");
    if (!response.ok) {
      throw new Error(`Failed to load plugin list: ${response.statusText}`);
    }

    const yaml = await import("js-yaml");
    const content = await response.text();
    const parsed = yaml.load(content);

    if (parsed && typeof parsed === "object" && "plugins" in parsed) {
      const pluginsObj = (parsed as any).plugins;

      // Transform the object structure to array of Plugintype
      if (pluginsObj && typeof pluginsObj === "object") {
        plugins.value = Object.entries(pluginsObj).map(
          ([name, config]: [string, any]) => ({
            name,
            version: config?.version || "unknown",
          }),
        );
      } else {
        plugins.value = [];
      }
    } else {
      plugins.value = [];
    }
  } catch (err: any) {
    console.error("Error loading configured plugins:", err);
    error.value = "Failed to load configured plugins.";
    plugins.value = [];
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
