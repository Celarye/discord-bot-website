<script setup lang="ts">
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const props = defineProps<{
  name: string;
  version: string;
  enabled?: boolean;
}>();

const enabledText = computed(() => {
  return props.enabled ? "Enabled" : "Disabled";
});
</script>

<template>
  <Card class="bg-muted/40">
    <CardContent class="p-4 flex justify-between items-center">
      <div class="flex gap-4">
        <p class="font-medium">{{ name }}</p>
        <Badge variant="secondary" class="text-xs">v{{ version }}</Badge>
      </div>
    <p :class="props.enabled ? 'bg-green-500' : 'bg-red-500'" class="rounded-lg p-2 border-2">{{ enabledText }}</p>
    </CardContent>
  </Card>
</template>
