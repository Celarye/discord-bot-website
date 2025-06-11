<script setup lang="ts">
import { computed, ref } from "vue";
import type { InstalledPlugin } from "~/assets/types/typelist";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import {
  Package,
  Trash2,
  Settings,
  CheckCircle,
  XCircle
} from "lucide-vue-next";

interface Props {
  plugins: InstalledPlugin[];
}

interface Emits {
  (e: "delete-plugin" | "configure-plugin", pluginName: string): void;
  (e: "toggle-plugin", pluginName: string, enabled: boolean): void;
}


const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Dialog state
const dialogOpen = ref(false);
const selectedPluginName = ref<string | null>(null);
const selectedVersion = ref("");
const availableVersions = ref<string[]>([]);
const isLoadingVersions = ref(false);

const enabledPlugins = computed(() =>
    props.plugins.filter(plugin => plugin.enabled)
);

const disabledPlugins = computed(() =>
    props.plugins.filter(plugin => !plugin.enabled)
);

const handleDeletePlugin = (pluginName: string) => {
  emit("delete-plugin", pluginName);
};
const handleConfigurePlugin = (pluginName: string) => {
  selectedPluginName.value = pluginName;

  // Find the current plugin to get its version
  const plugin = props.plugins.find(p => p.name === pluginName);
  if (plugin) {
    selectedVersion.value = plugin.version;
    // In a real app, you would fetch available versions here
    availableVersions.value = [plugin.version, "1.0.0", "1.1.0", "2.0.0"];
  }

  dialogOpen.value = true;
  emit("configure-plugin", pluginName);
};

const handleDialogSave = () => {
  // Handle saving the configuration here
  console.log("Saving configuration for:", selectedPluginName.value, "Version:", selectedVersion.value);
  dialogOpen.value = false;
};

const getPluginStatus = (plugin: InstalledPlugin) => {
  if (!plugin.enabled) return 'disabled';
  return 'enabled';
};

const getStatusIcon = (plugin: InstalledPlugin) => {
  return plugin.enabled ? CheckCircle : XCircle;
};

const getStatusColor = (plugin: InstalledPlugin) => {
  return plugin.enabled ? 'text-green-600' : 'text-red-600';
};
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <Package class="h-5 w-5" />
        Installed Plugins
        <Badge variant="secondary" class="ml-auto">
          {{ plugins.length }}
        </Badge>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div v-if="plugins.length === 0" class="text-center py-8 text-muted-foreground">
        <Package class="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p class="font-medium">No plugins installed</p>
        <p class="text-sm">Install plugins from the available list to get started</p>
      </div>

      <div v-else class="space-y-4">
        <!-- Enabled Plugins -->
        <div v-if="enabledPlugins.length > 0">
          <div class="flex items-center gap-2 mb-3">
            <CheckCircle class="h-4 w-4 text-green-600" />
            <span class="font-medium text-sm">Active Plugins</span>
            <Badge variant="secondary" class="text-xs">
              {{ enabledPlugins.length }}
            </Badge>
          </div>

          <div class="space-y-2">
            <Card v-for="plugin in enabledPlugins" :key="plugin.name" class="border-green-200 dark:border-green-800">
              <CardContent class="pt-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3 flex-1 min-w-0">
                    <component
                        :is="getStatusIcon(plugin)"
                        :class="['h-4 w-4', getStatusColor(plugin)]"
                    />
                    <div class="flex-1 min-w-0">
                      <h3 class="font-medium text-sm truncate">{{ plugin.name }}</h3>
                      <div class="flex items-center gap-2 mt-1">
                        <Badge variant="outline" class="text-xs h-5 px-2">
                          {{ plugin.version }}
                        </Badge>
                        <Badge variant="secondary" class="text-xs h-5 px-2">
                          {{ getPluginStatus(plugin) }}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        class="h-8 w-8 p-0"
                        @click="handleConfigurePlugin(plugin.name)"
                    >
                      <Settings class="h-3 w-3" />
                    </Button>

                    <Button
                        size="sm"
                        variant="destructive"
                        class="h-8 w-8 p-0"
                        @click="handleDeletePlugin(plugin.name)"
                    >
                      <Trash2 class="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <!-- Separator -->
        <Separator v-if="enabledPlugins.length > 0 && disabledPlugins.length > 0" />

        <!-- Disabled Plugins -->
        <div v-if="disabledPlugins.length > 0">
          <div class="flex items-center gap-2 mb-3">
            <XCircle class="h-4 w-4 text-red-600" />
            <span class="font-medium text-sm">Inactive Plugins</span>
            <Badge variant="secondary" class="text-xs">
              {{ disabledPlugins.length }}
            </Badge>
          </div>

          <div class="space-y-2">
            <Card v-for="plugin in disabledPlugins" :key="plugin.name" class="border-red-200 dark:border-red-800 opacity-60">
              <CardContent class="pt-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3 flex-1 min-w-0">
                    <component
                        :is="getStatusIcon(plugin)"
                        :class="['h-4 w-4', getStatusColor(plugin)]"
                    />
                    <div class="flex-1 min-w-0">
                      <h3 class="font-medium text-sm truncate">{{ plugin.name }}</h3>
                      <div class="flex items-center gap-2 mt-1">
                        <Badge variant="outline" class="text-xs h-5 px-2">
                          {{ plugin.version }}
                        </Badge>
                        <Badge variant="destructive" class="text-xs h-5 px-2">
                          disabled
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        class="h-8 w-8 p-0"
                        @click="handleConfigurePlugin(plugin.name)"
                    >
                      <Settings class="h-3 w-3" />
                    </Button>

                    <Button
                        size="sm"
                        variant="destructive"
                        class="h-8 w-8 p-0"
                        @click="handleDeletePlugin(plugin.name)"
                    >
                      <Trash2 class="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>

  <!-- Plugin Settings Dialog -->
  <Dialog v-model:open="dialogOpen">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>
          Plugin Settings for {{ selectedPluginName }}
        </DialogTitle>
        <DialogDescription v-if="selectedPluginName">
          Configure settings for this plugin
        </DialogDescription>
      </DialogHeader>

      <form v-if="selectedPluginName" class="grid gap-4 py-4" @submit.prevent="handleDialogSave">
        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="version" class="text-right">Version</Label>
          <div class="col-span-3">
            <Select v-model="selectedVersion">
              <SelectTrigger :disabled="isLoadingVersions">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="version in availableVersions" :key="version" :value="version">
                  {{ version }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="isLoadingVersions" class="text-xs text-muted-foreground mt-1">
              Loading available versions...
            </p>
            <p v-else-if="availableVersions.length === 0" class="text-xs text-muted-foreground mt-1">
              No additional versions available
            </p>
          </div>
        </div>

        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="setting1" class="text-right">Setting 1</Label>
          <Input id="setting1" placeholder="Setting 1 value" class="col-span-3" />
        </div>

        <div class="grid grid-cols-4 items-center gap-4">
          <Label for="setting2" class="text-right">Setting 2</Label>
          <Input id="setting2" placeholder="Setting 2 value" class="col-span-3" />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="dialogOpen = false">Cancel</Button>
          <Button type="submit" :disabled="isLoadingVersions">
            Save changes
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>