<script setup lang="ts">
import type { AvailablePlugins } from "~/assets/types/typelist";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings } from "lucide-vue-next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ref } from "vue";

defineProps<{
  availablePlugins: AvailablePlugins[];
  selectedVersions: { [key: string]: string };
}>();

defineEmits<{
  (e: "addPlugin", pluginName: string): void;
  (e: "updateVersion", pluginName: string, version: string): void;
}>();

const openPluginSettings = ref<string | null>(null);

const openSettings = (pluginName: string) => {
  openPluginSettings.value = pluginName;
};

</script>

<template>
  <div>
    <h3 class="text-lg font-semibold mb-3">Available Plugins</h3>
    <div class="space-y-3">
      <Card
        v-for="plugin in availablePlugins"
        :key="plugin.name"
      >
        <CardHeader class="pb-2">
          <CardTitle class="text-md">{{ plugin.name }}</CardTitle>
        </CardHeader>
        <CardContent class="pb-2">
          <div class="mb-2">
            <label class="text-sm mb-1 block">Version</label>
            <Select
              :value="selectedVersions[plugin.name]"
              @update:model-value="$emit('updateVersion', plugin.name, $event)"
            >
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Select version" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="version in plugin.versions"
                  :key="version"
                  :value="version"
                >
                  {{ version }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p class="text-sm text-muted-foreground">{{ plugin.description }}</p>
        </CardContent>
        <CardFooter class="flex gap-2">
          <Button
            variant="secondary"
            class="flex-1"
            @click="$emit('addPlugin', plugin.name)"
          >
            Add
          </Button>

          <Dialog>
            <DialogTrigger>
              <Button
                variant="outline"
                size="icon"
                @click="openSettings(plugin.name)"
              >
                <Settings class="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent class="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Plugin Configuration</DialogTitle>
                <DialogDescription>
                  Configure and add the {{ plugin.name }} plugin
                </DialogDescription>
              </DialogHeader>
              <div class="grid gap-4 py-4">
                <div class="grid grid-cols-4 items-center gap-4">
                  <Label for="plugin-name" class="text-right">Name</Label>
                  <Input id="plugin-name" :value="plugin.name" class="col-span-3" disabled />
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                  <Label for="plugin-version" class="text-right">Version</Label>
                  <Select
                    :value="selectedVersions[plugin.name]"
                    class="col-span-3"
                    @update:model-value="$emit('updateVersion', plugin.name, $event)"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select version" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        v-for="version in plugin.versions"
                        :key="version"
                        :value="version"
                      >
                        {{ version }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                  <Label for="setting1" class="text-right">Setting 1</Label>
                  <Input id="setting1" placeholder="Setting 1 value" class="col-span-3" />
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                  <Label for="setting2" class="text-right">Setting 2</Label>
                  <Input id="setting2" placeholder="Setting 2 value" class="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button @click="$emit('addPlugin', plugin.name)">Add Plugin</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </div>
  </div>
</template>