<script setup lang="ts">
import { computed, ref } from "vue";
import type { InstalledPlugin, RegistryPlugin } from "~/assets/types/typelist";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import PluginSettingsDialog from "~/components/molecules/PluginSettingsDialog.vue";
import {
  Package,
  Trash2,
  Settings,
  CheckCircle,
  XCircle
} from "lucide-vue-next";

type PluginSettings = Record<string, unknown>;
type PluginEnvironment = Record<string, string>;
type PluginDependency = {
  name: string;
  version?: string;
  registry?: string;
  [key: string]: unknown;
};

interface Props {
  plugins: Record<string, Omit<InstalledPlugin, 'name'>>;
  registryPlugins: Record<string, RegistryPlugin>;
}

interface Emits {
  (e: "delete-plugin", pluginName: string): void;
  (e: "configure-plugin", pluginName: string, withSettings?: boolean, settings?: PluginSettings, environment?: PluginEnvironment, dependencies?: PluginDependency[]): void;
  (e: "toggle-plugin", pluginName: string, enabled: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const showSettingsDialog = ref(false);
const selectedPluginName = ref<string | null>(null);
const selectedPlugin = ref<InstalledPlugin | null>(null);
const dialogSelectedVersion = ref('');

const pluginArray = computed(() => {
  return Object.entries(props.plugins).map(([name, pluginData]) => ({
    name,
    ...pluginData
  }));
});

const enabledPlugins = computed(() =>
    pluginArray.value.filter(plugin => plugin.enabled)
);

const disabledPlugins = computed(() =>
    pluginArray.value.filter(plugin => !plugin.enabled)
);

const availableVersions = computed(() => {
  if (!selectedPlugin.value) return [];

  const registryPlugin = props.registryPlugins[selectedPlugin.value.name];
  if (registryPlugin?.versions) {
    return registryPlugin.versions.map(v => v.version);
  }

  return [selectedPlugin.value.version];
});

const pluginSettingsWithValues = computed(() => {
  if (!selectedPlugin.value) {
    return undefined;
  }

  const registryPlugin = props.registryPlugins[selectedPlugin.value.name];
  const currentValues = selectedPlugin.value.settings;
  const currentEnvironment = selectedPlugin.value.environment;

  let settingsWithValues = undefined;
  const environmentWithValues: Record<string, string> = {};

  if (registryPlugin?.settings) {
    settingsWithValues = JSON.parse(JSON.stringify(registryPlugin.settings));

    if (currentValues && settingsWithValues.properties) {
      Object.keys(settingsWithValues.properties).forEach(key => {
        if (currentValues[key] !== undefined) {
          settingsWithValues.properties[key].default = currentValues[key];
        }
      });
    }
  }

  if (registryPlugin?.environment) {
    Object.entries(registryPlugin.environment).forEach(([key, value]) => {
      if (currentEnvironment && currentEnvironment[key] !== undefined) {
        environmentWithValues[key] = String(currentEnvironment[key]);
      } else if (value === true) {
        environmentWithValues[key] = "";
      } else if (typeof value === 'string') {
        environmentWithValues[key] = value;
      } else {
        environmentWithValues[key] = "";
      }
    });
  }

  if (currentEnvironment) {
    Object.entries(currentEnvironment).forEach(([key, value]) => {
      if (!(key in (registryPlugin?.environment || {}))) {
        environmentWithValues[key] = String(value);
      }
    });
  }

  return {
    settings: settingsWithValues,
    environment: Object.keys(environmentWithValues).length > 0 ? environmentWithValues : undefined
  };
});

const handleDeletePlugin = (pluginName: string) => {
  emit("delete-plugin", pluginName);
};

const handleConfigurePlugin = (pluginName: string) => {
  const plugin = pluginArray.value.find(p => p.name === pluginName);
  if (!plugin) {
    return;
  }

  selectedPluginName.value = pluginName;
  selectedPlugin.value = plugin;
  dialogSelectedVersion.value = plugin.version;

  setTimeout(() => {
    showSettingsDialog.value = true;
  }, 0);
};

const handleTogglePlugin = (pluginName: string, enabled: boolean) => {
  emit("toggle-plugin", pluginName, enabled);
};

const handleSettingsDialogSubmit = (settingsData?: PluginSettings, environmentData?: PluginEnvironment) => {
  if (!selectedPluginName.value) return;

  const processedEnvironment = environmentData ?
      Object.fromEntries(
          Object.entries(environmentData).map(([key, value]) => [key, String(value)])
      ) : undefined;

  emit("configure-plugin", selectedPluginName.value, true, settingsData, processedEnvironment, selectedPlugin.value?.dependencies);

  showSettingsDialog.value = false;
  selectedPluginName.value = null;
  selectedPlugin.value = null;
};

const handleDialogVersionChange = (version: string) => {
  dialogSelectedVersion.value = version;
};

const getPluginStatus = (plugin: InstalledPlugin) => {
  return plugin.enabled ? 'enabled' : 'disabled';
};

const getStatusIcon = (plugin: InstalledPlugin) => {
  return plugin.enabled ? CheckCircle : XCircle;
};

const getStatusColor = (plugin: InstalledPlugin) => {
  return plugin.enabled ? 'text-green-600' : 'text-red-600';
};

const getStatusBadgeVariant = (plugin: InstalledPlugin) => {
  return plugin.enabled ? 'secondary' : 'destructive';
};

const hasConfiguration = (plugin: InstalledPlugin) => {
  const registryPlugin = props.registryPlugins[plugin.name];
  return !!(registryPlugin?.settings || registryPlugin?.environment || plugin.dependencies?.length);
};
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <Package class="h-5 w-5" />
        Installed Plugins
        <Badge variant="secondary" class="ml-auto">
          {{ pluginArray.length }}
        </Badge>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div v-if="pluginArray.length === 0" class="text-center py-8 text-muted-foreground">
        <Package class="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p class="font-medium">No plugins installed</p>
        <p class="text-sm">Install plugins from the available list to get started</p>
      </div>

      <div v-else class="space-y-4">
        <!-- Active Plugins -->
        <div v-if="enabledPlugins.length > 0">
          <div class="flex items-center gap-2 mb-3">
            <CheckCircle class="h-4 w-4 text-green-600" />
            <span class="font-medium text-sm">Active Plugins</span>
            <Badge variant="secondary" class="text-xs">
              {{ enabledPlugins.length }}
            </Badge>
          </div>

          <div class="space-y-2">
            <Card
                v-for="plugin in enabledPlugins"
                :key="plugin.name"
                class="border-green-200 dark:border-green-800"
            >
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
                          v{{ plugin.version }}
                        </Badge>
                        <Badge :variant="getStatusBadgeVariant(plugin)" class="text-xs h-5 px-2">
                          {{ getPluginStatus(plugin) }}
                        </Badge>
                        <Badge
                            v-if="plugin.dependencies?.length"
                            variant="outline"
                            class="text-xs h-5 px-2"
                        >
                          {{ plugin.dependencies.length }} deps
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center gap-3">
                    <div class="flex items-center gap-2">
                      <label class="text-xs font-medium">
                        {{ plugin.enabled ? 'Enabled' : 'Disabled' }}
                      </label>
                      <Switch
                          :model-value="plugin.enabled"
                          @update:model-value="(value) => handleTogglePlugin(plugin.name, value)"
                      />
                    </div>

                    <div class="flex items-center gap-2">
                      <Button
                          v-if="hasConfiguration(plugin)"
                          size="sm"
                          variant="outline"
                          class="h-8 w-8 p-0"
                          :title="`Configure ${plugin.name}`"
                          @click="handleConfigurePlugin(plugin.name)"
                      >
                        <Settings class="h-3 w-3" />
                      </Button>

                      <Button
                          size="sm"
                          variant="destructive"
                          class="h-8 w-8 p-0"
                          :title="`Delete ${plugin.name}`"
                          @click="handleDeletePlugin(plugin.name)"
                      >
                        <Trash2 class="h-3 w-3" />
                      </Button>
                    </div>
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
            <Card
                v-for="plugin in disabledPlugins"
                :key="plugin.name"
                class="border-red-200 dark:border-red-800 opacity-60"
            >
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
                          v{{ plugin.version }}
                        </Badge>
                        <Badge :variant="getStatusBadgeVariant(plugin)" class="text-xs h-5 px-2">
                          {{ getPluginStatus(plugin) }}
                        </Badge>
                        <Badge
                            v-if="plugin.dependencies?.length"
                            variant="outline"
                            class="text-xs h-5 px-2"
                        >
                          {{ plugin.dependencies.length }} deps
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center gap-3">
                    <div class="flex items-center gap-2">
                      <label class="text-xs font-medium">
                        {{ plugin.enabled ? 'Enabled' : 'Disabled' }}
                      </label>
                      <Switch
                          :model-value="plugin.enabled"
                          @update:model-value="(value) => handleTogglePlugin(plugin.name, value)"
                      />
                    </div>

                    <div class="flex items-center gap-2">
                      <Button
                          v-if="hasConfiguration(plugin)"
                          size="sm"
                          variant="outline"
                          class="h-8 w-8 p-0"
                          :title="`Configure ${plugin.name}`"
                          @click="handleConfigurePlugin(plugin.name)"
                      >
                        <Settings class="h-3 w-3" />
                      </Button>

                      <Button
                          size="sm"
                          variant="destructive"
                          class="h-8 w-8 p-0"
                          :title="`Delete ${plugin.name}`"
                          @click="handleDeletePlugin(plugin.name)"
                      >
                        <Trash2 class="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>

  <!-- Settings Dialog -->
  <PluginSettingsDialog
      v-if="selectedPlugin && showSettingsDialog"
      v-model:open="showSettingsDialog"
      :plugin-name="selectedPlugin.name"
      :versions="availableVersions"
      :selected-version="dialogSelectedVersion"
      :settings="pluginSettingsWithValues?.settings"
      :environment="pluginSettingsWithValues?.environment"
      :dependencies="selectedPlugin.dependencies"
      mode="configure"
      @update:selected-version="handleDialogVersionChange"
      @save="handleSettingsDialogSubmit"
  />
</template>