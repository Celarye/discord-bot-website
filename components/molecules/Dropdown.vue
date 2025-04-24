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

const colorMode = useColorMode();
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
      <DropdownMenuLabel>Color</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem @click="colorMode.preference = 'light'">
        Light
      </DropdownMenuItem>
      <DropdownMenuItem @click="colorMode.preference = 'dark'">
        Dark
      </DropdownMenuItem>
      <DropdownMenuItem @click="colorMode.preference = 'system'">
        System
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
