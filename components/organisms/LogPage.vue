<script setup lang="ts">
import type { FilterValues, Log } from "~/assets/types/typelist";
import LogFilter from "~/components/molecules/LogFilter.vue";
import LogList from "~/components/molecules/LogList.vue";
import { useLogsStore } from "~/stores/logs";
import { computed, ref, watch } from "vue";

const logsStore = useLogsStore();

const filter = ref<FilterValues>({
  searchQuery: "",
  logLevels: {
    error: true,
    warning: true,
    info: true,
    debug: true,
    trace: false,
  },
  date: undefined,
});

const loadedDates = new Set<string>();

watch(
  () => filter.value.date,
  async (newDate) => {
    const dateString = newDate?.toString() ?? null;
        console.log("Selected date:", dateString); 
    if (!dateString || loadedDates.has(dateString)) return;

    try {
      await logsStore.fetchLogs(dateString);
      loadedDates.add(dateString);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    }
  },
  { immediate: true },
);

const logs = computed<Log[]>(() => {
  const dateString = filter.value.date?.toString() ?? null;
  if (!dateString) return [];
  return logsStore.logs[dateString] || [];
});

const filteredLogs = computed(() => {
  return logs.value.filter((log) => {
    if (!filter.value.logLevels[log.type]) return false;

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
      const filterDate = filter.value.date.toDate("UTC");

      if (
        logDate.getUTCFullYear() !== filterDate.getFullYear() ||
        logDate.getUTCMonth() !== filterDate.getMonth() ||
        logDate.getUTCDate() !== filterDate.getDate()
      ) {
        return false;
      }
    }

    return true;
  });
});

const handleSearch = (searchQuery: string) => {
  filter.value = {
    ...filter.value,
    searchQuery,
  };
};
</script>

<template>
  <div class="space-y-6 mx-auto">
    <LogFilter v-model="filter" @search="handleSearch" />
    <LogList :logs="filteredLogs" />
  </div>
</template>
