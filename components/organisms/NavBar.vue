<script setup lang="ts">
import ColorMode from "~/components/molecules/ColorMode.vue";
import Command from "~/components/molecules/Command.vue";
import NavigationMenu from "~/components/molecules/NavigationMenu.vue";
</script>

<template>
  <div class="flex flex-row justify-between container">
    <h1>Discord Bot</h1>
    <Command />
    <NavigationMenu/>
    <ColorMode />
  </div>
</template>
