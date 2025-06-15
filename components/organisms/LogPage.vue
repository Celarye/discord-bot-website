<script setup lang="ts">
import LogFilter from "@/components/molecules/LogFilter.vue";
import type { Log } from "~/assets/types/typelist";
import LogList from "../molecules/LogList.vue";

const logs = ref<Log[]>([
  {
    id: "1",
    type: "info",
    message: "This is an info log entry.",
    timestamp: new Date().toISOString(),
  },
  {
    id: "2",
    type: "warning",
    message: "This is a warning log entry.",
    timestamp: new Date().toISOString(),
  },
  {
    id: "3",
    type: "error",
    message: "This is an error log entry.",
    timestamp: new Date().toISOString(),
  },
]);
</script>

<template>
  <div class="space-y-6 p-4 max-w-3xl mx-auto">
    <LogFilter />
    <LogList :logs="logs" />
  </div>
</template>
