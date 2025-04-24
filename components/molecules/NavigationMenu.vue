<script setup lang="ts">
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
</script>

<template>
  <NavigationMenu>
    <NavigationMenuList>
      <NavigationMenuItem>
        <NavigationMenuTrigger>Navigate</NavigationMenuTrigger>
        <NavigationMenuContent>
          <NuxtLink to="/"><NavigationMenuLink>Dashboard</NavigationMenuLink></NuxtLink>
          <NuxtLink to="/configuration"><NavigationMenuLink>Configuration</NavigationMenuLink></NuxtLink>
          <NuxtLink to="/logs"><NavigationMenuLink>Logs</NavigationMenuLink></NuxtLink>
        </NavigationMenuContent>
      </NavigationMenuItem>
    </NavigationMenuList>
  </NavigationMenu>
</template>