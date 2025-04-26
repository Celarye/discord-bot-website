<script setup lang="ts">
import { Icon } from "@iconify/vue";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import ThemeToggle from "../atoms/ThemeToggle.vue";
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger>
      <Button variant="outline">
        <Icon icon="radix-icons:gear" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuLabel>My Account</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <NuxtLink to="/profile"
        ><DropdownMenuItem>Profile</DropdownMenuItem></NuxtLink
      >
      <NuxtLink to="/settings">
        <DropdownMenuItem>Settings</DropdownMenuItem>
      </NuxtLink>
      <DropdownMenuSeparator />
      <DropdownMenuLabel>Theme</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem>
        <ThemeToggle />
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
