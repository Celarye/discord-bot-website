<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { computed } from "vue";

const props = defineProps({
  count: {
    type: Number,
    required: true,
  },
});

const formattedCount = computed(() =>
  props.count.toLocaleString("en-US").replace(/,/g, " ")
);
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="text-center">Handled Requests</CardTitle>
    </CardHeader>
    <CardContent class="text-green-500 text-2xl font-bold text-center">
      {{ formattedCount }}
    </CardContent>
  </Card>
</template>
