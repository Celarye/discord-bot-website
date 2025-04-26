<script setup lang="ts">
const colorMode = useColorMode();
const toggleColorMode = () => {
  if (colorMode.preference === "system") {
    colorMode.preference = "light";
  } else {
    colorMode.preference = colorMode.preference === "light" ? "dark" : "light";
  }
};

const nextColorModeLabel = computed(() => {
  if (colorMode.preference === "dark") {
    return "Light";
  } else {
    return "Dark";
  }
});

const nextColorModeIcon = computed(() => {
  if (colorMode.preference === 'dark') {
    return 'radix-icons:sun';
  } else {
    return 'radix-icons:moon';
  }
});
</script>

<template>
    <ThemeToggle @click="toggleColorMode">
        <Icon :icon="nextColorModeIcon" />
        {{ nextColorModeLabel }}
    </ThemeToggle>
</template>