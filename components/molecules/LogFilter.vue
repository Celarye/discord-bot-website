<script setup lang="ts">
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
import { ref } from "vue";

const df = new DateFormatter("en-US", {
  dateStyle: "long",
});

const isAutomaticRefresh = ref(true);
const searchQuery = ref("");
const logLevels = ref({
  error: true,
  warning: true,
  info: true,
});

const value = ref<DateValue>();
</script>

<template>
  <div>
    <div class="flex items-center gap-2 mb-2">
      <Checkbox id="automatic-refresh" v-model="isAutomaticRefresh" label="Automatic refresh"/>
      <label for="automatic-refresh" class="ml-2">Automatic refresh</label>
    </div>
    <div class="flex flex-wrap gap-4 items-center">
      <!-- Search input -->
      <div class="relative w-full max-w-sm">
        <Input id="search" v-model="searchQuery" type="text" placeholder="Search..." class="pl-10" />
        <span
          class="absolute left-0 inset-y-0 flex items-center justify-center px-2"
        >
          <Search class="size-6 text-muted-foreground" />
        </span>
      </div>

      <!-- Date picker -->
      <div>
        <Popover>
          <PopoverTrigger as-child>
            <Button variant="outline" class="flex items-center">
              <CalendarIcon class="mr-2 h-4 w-4" />
              {{
                value
                  ? df.format(value.toDate(getLocalTimeZone()))
                  : "Pick a date"
              }}
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-auto p-0 mt-2">
            <Calendar v-model="value" initial-focus />
          </PopoverContent>
        </Popover>
      </div>
    </div>

    <!-- Log level checkboxes -->
    <div class="flex items-center mt-2 gap-55">
      <ul class="flex items-center gap-6 flex-wrap mt-4">
        <li class="flex items-center gap-2">
          <Checkbox id="error" v-model="logLevels.error" label="error" />
          <label for="error">Error</label>
        </li>
        <li class="flex items-center gap-2">
          <Checkbox id="warning" v-model="logLevels.warning" label="warning" />
          <label for="warning">Warning</label>
        </li>
        <li class="flex items-center gap-2">
          <Checkbox id="info" v-model="logLevels.info" label="info" />
          <label for="info">Info</label>
        </li>
      </ul>
      <Button>Filter</Button>
    </div>
  </div>
</template>
