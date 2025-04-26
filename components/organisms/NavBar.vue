<script setup lang="ts">
import Command from "~/components/molecules/Command.vue";
import Dropdown from "~/components/molecules/Dropdown.vue";
import NavigationMenu from "~/components/molecules/NavigationMenu.vue";
import Hamburger from "../molecules/Hamburger.vue";
</script>

<template>
  <nav class="backdrop-blur bg-background/95 outline fixed top-0 w-full supports-[backdrop-filter]:bg-background/60">
    <div
      class="flex flex-row items-center align-middle justify-between p-3 h-15 container m-auto"
    >
      <h1 class="text-xl align-baseline">Discord&nbsp;Bot</h1>
      <section class="flex flex-row gap-4">
        <Command />
        <div class="md:hidden"><Hamburger /></div>

        <section class="hidden md:flex flex-row justify-between gap-4">
          <NavigationMenu />
          <Dropdown />
        </section>
      </section>
    </div>
  </nav>
</template>
