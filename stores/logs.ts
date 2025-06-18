import type { Log } from "~/assets/types/typelist";

export const useLogsStore = defineStore("logs", () => {
  const logs = ref({} as Record<string, Log[]>);
  const loading = ref(false);
  const error = ref(null as string | null);

  const fetchLogs = async (date: string) => {
    if (logs.value[date]) return;
    loading.value = true;
    error.value = null;
    try {
      const data = await $fetch<string>(`http://localhost:8080/logs/${date}`);
      const lines = data.split("\n").filter((line) => line.trim() !== "");
      const parsedLogs = lines
        .map(parseLogLine)
        .filter((log): log is Log => log !== null);
      logs.value[date] = parsedLogs;
    } catch (err: unknown) {
      error.value =
        typeof err === "object" && err !== null && "message" in err
          ? (err as { message: string }).message
          : "Failed to fetch logs";
    } finally {
      loading.value = false;
    }
  };

  return {
    logs,
    loading,
    error,
    fetchLogs,
  };
});
