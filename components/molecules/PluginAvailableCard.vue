<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings } from "lucide-vue-next";

defineProps<{
  name: string;
  description: string;
  selectedVersion: string;
  versions: string[];
}>();

defineEmits<{
  (e: "settings" |"add", name: string): void;
  (e: "update-version", name: string, version: string): void;
}>();
</script>

<template>
  <Card>
    <CardHeader class="pb-2">
      <CardTitle class="text-md">{{ name }}</CardTitle>
    </CardHeader>
    <CardContent class="pb-2">
      <div class="mb-2">
        <label class="text-sm mb-1 block">Version</label>
        <Select
          :value="selectedVersion"
          @update:model-value="$emit('update-version', name, $event)"
        >
          <SelectTrigger class="w-full">
            <SelectValue placeholder="Select version" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="version in versions"
              :key="version"
              :value="version"
            >
              {{ version }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <p class="text-sm text-muted-foreground">{{ description }}</p>
    </CardContent>
    <CardFooter class="flex gap-2">
      <Button
        variant="secondary"
        class="flex-1"
        @click="$emit('add', name)"
      >
        Add
      </Button>

      <Button
        variant="outline"
        size="icon"
        @click="$emit('settings', name)"
      >
        <Settings class="h-4 w-4" />
      </Button>
    </CardFooter>
  </Card>
</template>