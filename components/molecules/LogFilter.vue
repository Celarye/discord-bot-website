<script setup lang="ts">
import type { FilterValues } from "@/assets/types/typelist";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DateFormatter,
  getLocalTimeZone,
  type DateValue,
} from "@internationalized/date";
import { CalendarIcon, Search } from "lucide-vue-next";
import { ref, watch } from "vue";

const df = new DateFormatter("en-US", {
  dateStyle: "long",
});
const props = defineProps<{ modelValue: FilterValues }>();
const emit = defineEmits<{
  (e: "update:modelValue", value: FilterValues): void;
  (e: "apply-filter"): void;
  (e: "search", searchQuery: string): void;
}>();
const localFilter = ref<FilterValues>({ ...props.modelValue });
const searchInput = ref<string>(props.modelValue.searchQuery || "");

// Watch for non-search changes and emit immediately
watch(
  () => ({
    logLevels: localFilter.value.logLevels,
    date: localFilter.value.date,
  }),
  () => {
    emit("update:modelValue", {
      ...localFilter.value,
      searchQuery: props.modelValue.searchQuery, // Keep the current applied search
    });
  },
  { deep: true, immediate: false },
);

// Sync with parent changes
watch(
  () => props.modelValue,
  (newValue) => {
    localFilter.value = { ...newValue };
    searchInput.value = newValue.searchQuery || "";
  },
  { deep: true },
);

// Handle date selection - ensure reactivity
const handleDateChange = (date: DateValue | undefined) => {
  localFilter.value = {
    ...localFilter.value,
    date: date || undefined,
  };
};

// Handle search button click
const handleSearch = () => {
  emit("search", searchInput.value);
};
// Search input uses v-model directly - no handler needed
</script>
<template>
  <div>
    <div class="flex flex-wrap gap-4 items-center justify-between max-w-xl">
      <!-- Search input with button -->
      <div class="flex w-full max-w-sm">
        <div class="relative flex-1">
          <Input
            id="search"
            v-model="searchInput"
            type="text"
            placeholder="Search..."
            class="rounded-r-none border-r-0"
            @keyup.enter="handleSearch"
          />
        </div>
        <Button
          class="rounded-l-none px-3"
          variant="outline"
          @click="handleSearch"
        >
          <Search class="h-4 w-4" />
        </Button>
      </div>
      <!-- Date picker -->
      <div>
        <Popover>
          <PopoverTrigger as-child>
            <Button variant="outline" class="flex items-center">
              <CalendarIcon class="mr-2 h-4 w-4" />
              {{
                localFilter.date
                  ? df.format(localFilter.date.toDate(getLocalTimeZone()))
                  : "Pick a date"
              }}
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-auto p-0 mt-2">
            <Calendar
              :model-value="localFilter.date"
              @update:model-value="handleDateChange"
            />
            <div class="flex justify-end p-2 border-t">
              <Button size="sm" @click="handleDateChange(undefined)">
                Clear
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
    <!-- Log level checkboxes -->
    <div class="flex items-center mt-2 justify-between">
      <ul class="flex items-center gap-6 flex-wrap mt-4">
        <li class="flex items-center gap-2">
          <Checkbox
        id="error"
        :key="`error-${localFilter.logLevels.error}`"
        v-model="localFilter.logLevels.error"
          />
          <label for="error">Error</label>
        </li>
        <li class="flex items-center gap-2">
          <Checkbox
        id="warning"
        :key="`warning-${localFilter.logLevels.warning}`"
        v-model="localFilter.logLevels.warning"
          />
          <label for="warning">Warning</label>
        </li>
        <li class="flex items-center gap-2">
          <Checkbox
        id="info"
        :key="`info-${localFilter.logLevels.info}`"
        v-model="localFilter.logLevels.info"
          />
          <label for="info">Info</label>
        </li>
        <li class="flex items-center gap-2">
          <Checkbox
        id="debug"
        :key="`debug-${localFilter.logLevels.debug}`"
        v-model="localFilter.logLevels.debug"
          />
          <label for="debug">Debug</label>
        </li>
        <li class="flex items-center gap-2">
          <Checkbox
        id="trace"
        :key="`trace-${localFilter.logLevels.trace}`"
        v-model="localFilter.logLevels.trace"
          />
          <label for="trace">Trace</label>
        </li>
      </ul>
    </div>
  </div>
</template>
