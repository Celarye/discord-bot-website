<script setup lang="ts">
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

defineProps<{
  name: string;
  version: string;
  enabled?: boolean;
}>();
</script>

<template>
  <Card class="bg-muted/40">
    <CardContent class="p-4 flex justify-between items-center">
      <p class="font-medium">{{ name }}</p>
      <Badge variant="secondary" class="text-xs">v{{ version }}</Badge>
    </CardContent>
  </Card>
</template>
