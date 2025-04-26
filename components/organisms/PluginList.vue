<script setup lang="ts">
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Plugintype } from "~/assets/types/typelist";
import { Settings, Trash } from "lucide-vue-next";
import { computed, onMounted, ref, watch } from "vue";
import { parse as parseYaml } from "yaml";

const props = defineProps<{
  plugins: Plugintype[];
}>();

const localPlugins = ref<Plugintype[]>([]);

watch(
  () => props.plugins,
  (newPlugins) => {
    localPlugins.value = JSON.parse(JSON.stringify(newPlugins));
  },
  { immediate: true, deep: true },
);

const emit = defineEmits<{
  (e: "deletePlugin", pluginName: string): void;
  (e: "updatePluginVersion", pluginName: string, newVersion: string): void;
}>();

const selectedPluginName = ref<string | null>(null);
const isDialogOpen = ref(false);
const selectedVersion = ref("");
const pluginsYamlData = ref<never>(null);
const isLoading = ref(false);

const fetchPluginsYaml = async () => {
  try {
    isLoading.value = true;
    const response = await fetch("/plugins.yaml");
    const yamlText = await response.text();
    pluginsYamlData.value = parseYaml(yamlText);
  } catch (error) {
    console.error("Error loading plugins.yaml:", error);
  } finally {
    isLoading.value = false;
  }
};

const getAvailableVersions = (pluginName: string) => {
  if (!pluginsYamlData.value || !pluginsYamlData.value.plugins) return [];

  const pluginInfo = pluginsYamlData.value.plugins.find(
    (p: never) => p.name === pluginName,
  );

  if (pluginInfo && pluginInfo.versions) {
    return pluginInfo.versions;
  }

  const currentPlugin = localPlugins.value.find((p) => p.name === pluginName);
  return currentPlugin ? [currentPlugin.version] : [];
};

const selectedPlugin = computed(() => {
  if (!selectedPluginName.value) return null;
  return (
    localPlugins.value.find(
      (plugin) => plugin.name === selectedPluginName.value,
    ) || null
  );
});

const availableVersions = computed(() => {
  if (!selectedPluginName.value) return [];
  return getAvailableVersions(selectedPluginName.value);
});

const openSettings = (pluginName: string) => {
  selectedPluginName.value = pluginName;

  const plugin = localPlugins.value.find((p) => p.name === pluginName);
  if (plugin) {
    selectedVersion.value = plugin.version;
  }

  isDialogOpen.value = true;
};

const closeDialog = () => {
  isDialogOpen.value = false;
};

const saveSettings = () => {
  if (selectedPlugin.value && selectedVersion.value) {
    const pluginIndex = localPlugins.value.findIndex(
      (p) => p.name === selectedPlugin.value?.name,
    );
    if (pluginIndex !== -1) {
      localPlugins.value[pluginIndex] = {
        ...localPlugins.value[pluginIndex],
        version: selectedVersion.value,
      };
    }

    emit(
      "updatePluginVersion",
      selectedPlugin.value.name,
      selectedVersion.value,
    );

    isDialogOpen.value = false;
  }
};

watch(
  () => isDialogOpen.value,
  (newValue) => {
    if (!newValue) {
      selectedPluginName.value = null;
      selectedVersion.value = "";
    }
  },
  { flush: 'post' }
);

onMounted(() => {
  fetchPluginsYaml();
});
</script>

<template>
  <div v-if="localPlugins.length" class="mt-4">
    <h3 class="font-semibold mb-3">Configured Plugins</h3>
    <div class="space-y-2">
      <Card
        v-for="plugin in localPlugins"
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
            <Button
              variant="outline"
              size="icon"
              @click="openSettings(plugin.name)"
            >
              <Settings class="h-4 w-4" />
            </Button>
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

  <Dialog :open="isDialogOpen" @update:open="(val) => { if (!val) closeDialog(); }">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Plugin Settings for {{ selectedPlugin?.name }}</DialogTitle>
        <DialogDescription v-if="selectedPlugin">
          Configure settings
        </DialogDescription>
      </DialogHeader>

      <form
        v-if="selectedPlugin"
        @submit.prevent="saveSettings"
        class="grid gap-4 py-4"
      >

        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="version" class="text-right">Version</Label>
          <div class="col-span-3">
            <Select v-model="selectedVersion">
              <SelectTrigger :disabled="isLoading">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="version in availableVersions"
                  :key="version"
                  :value="version"
                >
                  {{ version }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="isLoading" class="text-xs text-muted-foreground mt-1">
              Loading available versions...
            </p>
            <p
              v-else-if="availableVersions.length === 0"
              class="text-xs text-muted-foreground mt-1"
            >
              No additional versions available
            </p>
          </div>
        </div>

        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="setting1" class="text-right">Setting 1</Label>
          <Input
            id="setting1"
            placeholder="Setting 1 value"
            class="col-span-3"
          />
        </div>

        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="setting2" class="text-right">Setting 2</Label>
          <Input
            id="setting2"
            placeholder="Setting 2 value"
            class="col-span-3"
          />
        </div>

        <DialogFooter>
          <Button type="button" @click="closeDialog" variant="outline">Cancel</Button>
          <Button type="submit" :disabled="isLoading">Save changes</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>