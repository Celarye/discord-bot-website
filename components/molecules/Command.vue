<script setup lang="ts">
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Icon } from "@iconify/vue";
import { useMagicKeys } from "@vueuse/core";
import { ref, watch } from "vue";
import { useRouter } from "vue-router";

const open = ref(false);

const isMac =
  typeof navigator !== "undefined" && !navigator.userAgent.includes("Mac");
const shortcutKey = computed(() => (isMac ? "⌘" : "Ctrl"));

const { Meta_K, Ctrl_K } = useMagicKeys({
  passive: false,
  onEventFired(e) {
    if (e.key === "k" && (e.metaKey || e.ctrlKey)) e.preventDefault();
  },
});

watch([Meta_K, Ctrl_K], (v) => {
  if (v[0] || v[1]) handleOpenChange();
});

const router = useRouter();
watch(
  () => router.currentRoute.value.fullPath,
  () => {
    open.value = false;
  },
);

function handleOpenChange() {
  open.value = !open.value;
}
</script>

<template>
  <div>
    <Button class="p-2" variant="outline" @click="handleOpenChange">
      <div
        class="text-sm text-muted-foreground flex flex-row items-center gap-2 sm:gap-4"
      >
        <Icon icon="radix-icons:magnifying-glass" class="sm:hidden"/>
        <p class="hidden sm:block">Quick Search...</p>
        <kbd
          class="pointer-events-none px-1 flex flex-row gap-1 items-center select-none rounded border bg-muted font-mono font-medium text-muted-foreground opacity-100"
          ><span class="text-xs">{{ shortcutKey }}</span
          ><span>K</span>
        </kbd>
      </div>
    </Button>
    <CommandDialog v-model:open="open">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <NuxtLink to="/">
            <CommandItem value="dashboard">Dashboard</CommandItem>
          </NuxtLink>
          <NuxtLink to="/configuration">
            <CommandItem value="configuration">Configuration</CommandItem>
          </NuxtLink>
          <NuxtLink to="/logs">
            <CommandItem value="logs">Logs</CommandItem>
          </NuxtLink>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <NuxtLink to="/profile">
            <CommandItem value="profile">Profile</CommandItem>
          </NuxtLink>
          <NuxtLink to="/settings">
            <CommandItem value="settings">Settings</CommandItem>
          </NuxtLink>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  </div>
</template>
