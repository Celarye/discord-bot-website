<script setup lang="ts">
import type { Plugintype } from "~/assets/types/typelist";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash, Settings } from "lucide-vue-next";
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
  plugins: Plugintype[];
}>();

defineEmits<{
  (e: "deletePlugin", pluginName: string): void;
}>();

const openPluginSettings = ref<string | null>(null);

const openSettings = (pluginName: string) => {
  openPluginSettings.value = pluginName;
};

</script>

<template>
  <div v-if="plugins.length" class="mt-4">
    <h3 class="font-semibold mb-3">Configured Plugins</h3>
    <div class="space-y-2">
      <Card
        v-for="plugin in plugins"
        :key="plugin.name"
        class="bg-muted/40"
      >
        <CardContent class="p-4 flex justify-between items-center">
          <div>
            <p class="font-medium">{{ plugin.name }}</p>
            <div class="flex items-center mt-1">
              <Badge variant="secondary" class="text-xs">
                v{{ plugin.version }}
              </Badge>
            </div>
          </div>
          <div class="flex space-x-2">
            <Dialog>
              <DialogTrigger as-child>
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
                  <DialogTitle>Plugin Settings</DialogTitle>
                  <DialogDescription>
                    Configure settings for {{ plugin.name }}
                  </DialogDescription>
                </DialogHeader>
                <div class="grid gap-4 py-4">
                  <div class="grid grid-cols-4 items-center gap-4">
                    <Label for="name" class="text-right">Name</Label>
                    <Input id="name" :value="plugin.name" class="col-span-3" disabled />
                  </div>
                  <div class="grid grid-cols-4 items-center gap-4">
                    <Label for="version" class="text-right">Version</Label>
                    <Input id="version" :value="plugin.version" class="col-span-3" disabled />
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
                  <Button type="submit">Save changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button
              variant="destructive"
              size="icon"
              @click="$emit('deletePlugin', plugin.name)"
            >
              <Trash class="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
  <div v-else class="text-center py-6 text-muted-foreground">
    No plugins configured yet. Add plugins from the available list.
  </div>
</template>