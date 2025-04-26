<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@iconify/vue";
import ThemeToggle from "../atoms/ThemeToggle.vue";
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger>
      <Button variant="outline">
        <Icon icon="radix-icons:hamburger-menu" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuLabel>Navigation</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem>
        <NuxtLink to="/">Dashboard</NuxtLink>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <NuxtLink to="/configuration">Configuration</NuxtLink>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <NuxtLink to="/logs">Logs</NuxtLink>
      </DropdownMenuItem>
      <!--  -->
      <DropdownMenuSeparator />
      <DropdownMenuLabel>My Account</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <NuxtLink to="/profile"
        ><DropdownMenuItem>Profile</DropdownMenuItem></NuxtLink
      >
      <NuxtLink to="/settings">
        <DropdownMenuItem>Settings</DropdownMenuItem>
      </NuxtLink>
      <!--  -->
      <DropdownMenuSeparator />
      <DropdownMenuLabel>Theme</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem>
        <ThemeToggle/>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
