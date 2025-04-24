<script setup lang="ts">
import Command from "~/components/molecules/Command.vue";
import Dropdown from "~/components/molecules/Dropdown.vue";
import NavigationMenu from "~/components/molecules/NavigationMenu.vue";
</script>

<template>
  <div class="backdrop-opacity-95 backdrop-blur-xs outline fixed top-0 w-full">
    <div class="flex flex-row align-center justify-between p-3 h-15 container m-auto">
      <h1 class="text-xl align-middle">Discord Bot</h1>
      <section class="flex flex-row justify-between gap-2">
        <Command />
        <NavigationMenu />
        <Dropdown />
      </section>
    </div>
  </div>
</template>
