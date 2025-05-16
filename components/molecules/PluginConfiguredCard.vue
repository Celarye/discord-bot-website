<script setup lang="ts">
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Settings, Trash } from "lucide-vue-next";

defineProps<{
  name: string;
  version: string;
}>();

defineEmits<{
  (e: "settings" | "delete", name: string): void;
}>();
</script>

<template>
  <Card class="bg-muted/40">
    <CardContent class="p-4 flex justify-between items-center">
      <div>
        <p class="font-medium">{{ name }}</p>
        <div class="flex items-center mt-1">
          <Badge variant="secondary" class="text-xs">
            v{{ version }}
          </Badge>
        </div>
      </div>
      <div class="flex space-x-2">
        <Button
          variant="outline"
          size="icon"
          @click="$emit('settings', name)"
        >
          <Settings class="h-4 w-4" />
        </Button>
        <Button
          variant="destructive"
          size="icon"
          @click="$emit('delete', name)"
        >
          <Trash class="h-4 w-4" />
        </Button>
      </div>
    </CardContent>
  </Card>
</template>