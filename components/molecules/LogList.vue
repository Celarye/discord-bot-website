<script setup lang="ts">
import type { Log } from "@/assets/types/typelist.ts";
import LogCard from "@/components/atoms/LogCard.vue";

defineProps<{ logs: Log[] }>();
</script>

<template>
  <ul>
    <li v-for="l in logs" :key="l.id">
      <LogCard :type="l.type" :message="l.message" :timestamp="l.timestamp" />
    </li>
  </ul>
</template>
