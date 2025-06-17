<!-- <script setup>
import { defineProps } from "vue";

const props = defineProps({
  count: {
    type: Number,
    required: true,
  },
});
</script>

<template>
  <div class="flex items-center gap-2">
    <span class="text-muted-foreground">Handled Requests:</span>
    <span class="font-semibold">{{ props.count }}</span>
  </div>
</template> -->

<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

defineProps({
  count: {
    type: Number,
    required: true,
  },
});
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Handled Requests</CardTitle>
    </CardHeader>
    <CardContent>
      The bot has handled <span class="text-green-500">{{ count }}</span> Requests
    </CardContent>
  </Card>
</template>
