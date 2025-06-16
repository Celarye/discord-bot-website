<script setup>
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
</template>
