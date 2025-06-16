<script setup lang="ts">
import BotStatus from "@/components/atoms/BotStatus.vue";
import PowerButton from "@/components/atoms/PowerButton.vue";

defineProps<{
  botStatus: boolean;
}>();

const emit = defineEmits<{
  (e: "update:botStatus", value: boolean): void;
  (e: "restart"): void;
}>();

function handlePowerChange(newState: "on" | "off") {
  emit("update:botStatus", newState === "on");
}

function handleRestart() {
  emit("restart");
}
</script>

<template>
  <div class="flex items-center justify-around gap-4">
    <BotStatus :online="botStatus" />
    <PowerButton
      :online="botStatus"
      @power="handlePowerChange"
      @restart="handleRestart"
    />
  </div>
</template>
