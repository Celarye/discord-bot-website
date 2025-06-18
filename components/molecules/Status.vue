<script setup lang="ts">
import BotStatus from "@/components/atoms/BotStatus.vue";
import PowerButton from "@/components/atoms/PowerButton.vue";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
  <Card class="w-full mx-auto min-w-[217px]">
    <CardHeader>
      <CardTitle class="text-center text-xl">Bot Status</CardTitle>
    </CardHeader>
    <div class="border-b border-gray-200 dark:border-gray-700" />
    <CardContent class="flex justify-center">
      <BotStatus :online="botStatus" />
    </CardContent>
    <CardFooter>
      <PowerButton
        :online="botStatus"
        class="w-full flex justify-center items-center"
        @power="handlePowerChange"
        @restart="handleRestart"
      />
    </CardFooter>
  </Card>
</template>
