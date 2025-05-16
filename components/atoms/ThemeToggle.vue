<script setup lang="ts">
import { Icon } from "@iconify/vue";

const colorMode = useColorMode();

const toggleColorMode = () => {
  switch (colorMode.preference) {
    case "system":
      colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
      break;
    case "light":
      colorMode.preference = "dark";
      break;
    case "dark":
      colorMode.preference = "light";
  }
};

const nextColorModeLabel = computed(() => {
  if (colorMode.preference === "dark") {
    return "Light";
  } else {
    return "Dark";
  }
});

const nextColorModeIcon = computed(() =>
  colorMode.preference === "dark" ? "radix-icons:sun" : "radix-icons:moon",
);
</script>

<template>
  <span @click="toggleColorMode" class="flex flex-row gap-2 items-center">
    <Icon :icon="nextColorModeIcon" />
    {{ nextColorModeLabel }}
  </span>
</template>
