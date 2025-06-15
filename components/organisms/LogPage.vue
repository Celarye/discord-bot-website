<script setup lang="ts">
import LogFilter from "@/components/molecules/LogFilter.vue";
import { getLocalTimeZone } from "@internationalized/date";
import type { FilterValues, Log } from "~/assets/types/typelist";
import { computed, ref, watch } from "vue";
import LogList from "../molecules/LogList.vue";

const filter = ref<FilterValues>({
  searchQuery: "",
  logLevels: {
    error: true,
    warning: true,
    info: true,
  },
  date: undefined,
});

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

const filteredLogs = computed(() => {
  return logs.value.filter((log) => {
    if (!filter.value.logLevels[log.type]) {
      return false;
    }
    if (
      filter.value.searchQuery?.trim() &&
      !log.message
        .toLowerCase()
        .includes(filter.value.searchQuery.toLowerCase())
    ) {
      return false;
    }
    if (filter.value.date) {
      const logDate = new Date(log.timestamp);
      const filterDate = filter.value.date.toDate(getLocalTimeZone());
      if (logDate.toDateString() !== filterDate.toDateString()) {
        return false;
      }
    }
    return true;
  });
});

// Handle search button click
const handleSearch = (searchQuery: string) => {
  console.log("Search triggered with query:", searchQuery);
  // Create a new filter object to trigger reactivity
  filter.value = {
    ...filter.value,
    searchQuery: searchQuery,
  };
};

watch(
  () => filter.value.searchQuery,
  (newValue) => {
    console.log("Applied search query:", newValue);
  },
  { immediate: true },
);

watch(filteredLogs, (newLogs) => {
  console.log("Filtered logs updated:", newLogs.length);
});
</script>

<template>
  <div class="space-y-6 p-4 max-w-3xl mx-auto">
    <LogFilter v-model="filter" @search="handleSearch" />
    <LogList :logs="filteredLogs" />
  </div>
</template>
