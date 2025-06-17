<script setup>
import { computed, defineProps } from "vue";

const props = defineProps({
  online: {
    type: Boolean,
    default: false,
  },
});

const statusText = computed(() => (props.online ? "Online" : "Offline"));
const statusClass = computed(() => (props.online ? "online" : "offline"));
</script>

<template>
  <div
    :class="[
      'flex items-center font-bold text-lg',
      statusClass === 'online' ? 'text-green-500' : 'text-gray-500',
    ]"
  >
    <span
      class="w-2.5 h-2.5 rounded-full mr-2"
      :class="statusClass === 'online' ? 'bg-green-500' : 'bg-gray-400'"
    />
    <span>{{ statusText }}</span>
  </div>
</template>
