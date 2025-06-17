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
      <CardTitle>Bot Status</CardTitle>
    </CardHeader>
    <CardContent>
      <BotStatus :online="botStatus" />
    </CardContent>
    <CardFooter>
      <PowerButton
        :online="botStatus"
        @power="handlePowerChange"
        @restart="handleRestart"
      />
    </CardFooter>
  </Card>
</template>
