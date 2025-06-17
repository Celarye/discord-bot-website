<script setup lang="ts">
import LogCard from "@/components/atoms/LogCard.vue";
import type { Log } from "@/assets/types/typelist.ts";
defineProps<{logs: Log[]}>()
</script>

<template>
  <ul>
    <li v-for="l in logs" :key="l.id">
      <LogCard :type="l.type" :message="l.message" :timestamp="l.timestamp" />
    </li>
  </ul>
</template>