<script setup lang="ts">
import {
  DropdownMenuTrigger,
  useForwardProps,
  type DropdownMenuTriggerProps,
} from "reka-ui";

const props = defineProps<DropdownMenuTriggerProps>();

const forwardedProps = useForwardProps(props);
</script>

<template>
  <DropdownMenuTrigger
    data-slot="dropdown-menu-trigger"
    v-bind="forwardedProps"
  >
    <slot />
  </DropdownMenuTrigger>
</template>
