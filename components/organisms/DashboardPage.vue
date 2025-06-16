<script setup lang="ts">
import HandledRequestsCounter from "@/components/atoms/HandledRequestsCounter.vue";
import Status from "@/components/molecules/Status.vue";
import PluginInstalled from "@/components/organisms/PluginInstalled.vue";
import { ref } from "vue";

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
</script>

<template>
  <div class="flex items-center justify-around container h-screen p-4">
    <div>
      <!-- Status with restart -->
      <Status
        :bot-status="botStatus"
        @update:bot-status="toggleBotStatus"
        @restart="restartBot"
      />

      <!-- Requests Handled -->
      <HandledRequestsCounter :count="42" />
    </div>

    <!-- Plugin List -->
    <PluginInstalled />
  </div>
</template>
