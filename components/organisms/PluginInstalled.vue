<script setup lang="ts">
<<<<<<< configuration-with-registry
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
=======
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import type { InstalledPlugin, RegistryPlugin } from "~/assets/types/typelist";
import PluginSettingsDialog from "~/components/molecules/PluginSettingsDialog.vue";
import {
  CheckCircle,
  Package,
  Settings,
  Trash2,
  XCircle,
} from "lucide-vue-next";
import { computed, ref } from "vue";

// Define more specific types
type PluginSettings = Record<string, unknown>;
type PluginEnvironment = Record<string, unknown>;
type PluginDependency = {
  name: string;
  version?: string;
>>>>>>> master
  [key: string]: unknown;
};

interface Props {
<<<<<<< configuration-with-registry
  plugins: Record<string, Omit<InstalledPlugin, 'name'>>;
=======
  plugins: Record<string, Omit<InstalledPlugin, "name">>;
>>>>>>> master
  registryPlugins: Record<string, RegistryPlugin>;
}

interface Emits {
  (e: "delete-plugin", pluginName: string): void;
<<<<<<< configuration-with-registry
  (e: "configure-plugin", pluginName: string, withSettings?: boolean, settings?: PluginSettings, environment?: PluginEnvironment, dependencies?: PluginDependency[]): void;
=======
  (
    e: "configure-plugin",
    pluginName: string,
    withSettings?: boolean,
    settings?: PluginSettings,
    environment?: PluginEnvironment,
    dependencies?: PluginDependency[],
  ): void;
>>>>>>> master
  (e: "toggle-plugin", pluginName: string, enabled: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const showSettingsDialog = ref(false);
const selectedPluginName = ref<string | null>(null);
const selectedPlugin = ref<InstalledPlugin | null>(null);
<<<<<<< configuration-with-registry
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
=======
const dialogSelectedVersion = ref("");

const pluginArray = computed(() => {
  return Object.entries(props.plugins).map(([name, pluginData]) => ({
    name,
    ...pluginData,
  }));
});

const enabledPlugins = computed(() =>
  pluginArray.value.filter((plugin) => plugin.enabled),
);

const disabledPlugins = computed(() =>
  pluginArray.value.filter((plugin) => !plugin.enabled),
);

const availableVersions = computed(() => {
  if (!selectedPlugin.value) return [];

  const registryPlugin = props.registryPlugins[selectedPlugin.value.name];
  if (registryPlugin?.versions) {
    return registryPlugin.versions.map((v) => v.version);
  }

  if (selectedPlugin.value.versions) {
    return selectedPlugin.value.versions.map((v) => v.version);
  }

  return [selectedPlugin.value.version];
});

const pluginSettingsWithValues = computed(() => {
  if (!selectedPlugin.value) {
    return undefined;
  }

  const registryPlugin = props.registryPlugins[selectedPlugin.value.name];
  const settingsSchema = registryPlugin?.settings;
  const currentValues = selectedPlugin.value.settings;
  const currentEnvironment = selectedPlugin.value.environment;

  let settingsWithValues = undefined;
  let environmentWithValues = undefined;

  if (settingsSchema && settingsSchema.properties) {
    settingsWithValues = JSON.parse(JSON.stringify(settingsSchema));

    if (currentValues && settingsWithValues.properties) {
      Object.keys(settingsWithValues.properties).forEach((key) => {
        if (currentValues[key] !== undefined) {
          settingsWithValues.properties[key].default = currentValues[key];
        }
      });
    }
  } else {
    settingsWithValues = settingsSchema;
  }

  if (
    currentEnvironment &&
    typeof currentEnvironment === "object" &&
    Object.keys(currentEnvironment).length > 0
  ) {
    environmentWithValues = { ...currentEnvironment };
  } else {
    environmentWithValues = undefined;
  }

  return {
    settings: settingsWithValues,
    environment: environmentWithValues,
>>>>>>> master
  };
});

const handleDeletePlugin = (pluginName: string) => {
  emit("delete-plugin", pluginName);
};

const handleConfigurePlugin = (pluginName: string) => {
<<<<<<< configuration-with-registry
  const plugin = pluginArray.value.find(p => p.name === pluginName);
=======
  const plugin = pluginArray.value.find((p) => p.name === pluginName);
>>>>>>> master
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

<<<<<<< configuration-with-registry
const handleSettingsDialogSubmit = (settingsData?: PluginSettings, environmentData?: PluginEnvironment) => {
  if (!selectedPluginName.value) return;

  const processedEnvironment = environmentData ?
      Object.fromEntries(
          Object.entries(environmentData).map(([key, value]) => [key, String(value)])
      ) : undefined;

  emit("configure-plugin", selectedPluginName.value, true, settingsData, processedEnvironment, selectedPlugin.value?.dependencies);
=======
const handleSettingsDialogSubmit = (
  settingsData?: PluginSettings,
  environmentData?: PluginEnvironment,
) => {
  if (!selectedPluginName.value) return;

  emit(
    "configure-plugin",
    selectedPluginName.value,
    true,
    settingsData,
    environmentData,
    selectedPlugin.value?.dependencies,
  );
>>>>>>> master

  showSettingsDialog.value = false;
  selectedPluginName.value = null;
  selectedPlugin.value = null;
};

const handleDialogVersionChange = (version: string) => {
  dialogSelectedVersion.value = version;
};

const getPluginStatus = (plugin: InstalledPlugin) => {
<<<<<<< configuration-with-registry
  return plugin.enabled ? 'enabled' : 'disabled';
=======
  if (!plugin.enabled) return "disabled";
  return "enabled";
>>>>>>> master
};

const getStatusIcon = (plugin: InstalledPlugin) => {
  return plugin.enabled ? CheckCircle : XCircle;
};

const getStatusColor = (plugin: InstalledPlugin) => {
<<<<<<< configuration-with-registry
  return plugin.enabled ? 'text-green-600' : 'text-red-600';
};

const getStatusBadgeVariant = (plugin: InstalledPlugin) => {
  return plugin.enabled ? 'secondary' : 'destructive';
};

const hasConfiguration = (plugin: InstalledPlugin) => {
  const registryPlugin = props.registryPlugins[plugin.name];
  return !!(registryPlugin?.settings || registryPlugin?.environment || plugin.dependencies?.length);
=======
  return plugin.enabled ? "text-green-600" : "text-red-600";
>>>>>>> master
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
<<<<<<< configuration-with-registry
      <div v-if="pluginArray.length === 0" class="text-center py-8 text-muted-foreground">
        <Package class="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p class="font-medium">No plugins installed</p>
        <p class="text-sm">Install plugins from the available list to get started</p>
      </div>

      <div v-else class="space-y-4">
        <!-- Active Plugins -->
=======
      <div
        v-if="pluginArray.length === 0"
        class="text-center py-8 text-muted-foreground"
      >
        <Package class="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p class="font-medium">No plugins installed</p>
        <p class="text-sm">
          Install plugins from the available list to get started
        </p>
      </div>

      <div v-else class="space-y-4">
>>>>>>> master
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
<<<<<<< configuration-with-registry
                v-for="plugin in enabledPlugins"
                :key="plugin.name"
                class="border-green-200 dark:border-green-800"
=======
              v-for="plugin in enabledPlugins"
              :key="plugin.name"
              class="border-green-200 dark:border-green-800"
>>>>>>> master
            >
              <CardContent class="pt-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3 flex-1 min-w-0">
                    <component
<<<<<<< configuration-with-registry
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
=======
                      :is="getStatusIcon(plugin)"
                      :class="['h-4 w-4', getStatusColor(plugin)]"
                    />
                    <div class="flex-1 min-w-0">
                      <h3 class="font-medium text-sm truncate">
                        {{ plugin.name }}
                      </h3>
                      <div class="flex items-center gap-2 mt-1">
                        <Badge variant="outline" class="text-xs h-5 px-2">
                          {{ plugin.version }}
                        </Badge>
                        <Badge variant="secondary" class="text-xs h-5 px-2">
                          {{ getPluginStatus(plugin) }}
                        </Badge>
>>>>>>> master
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center gap-3">
                    <div class="flex items-center gap-2">
                      <label class="text-xs font-medium">
<<<<<<< configuration-with-registry
                        {{ plugin.enabled ? 'Enabled' : 'Disabled' }}
                      </label>
                      <Switch
                          :model-value="plugin.enabled"
                          @update:model-value="(value) => handleTogglePlugin(plugin.name, value)"
=======
                        {{ plugin.enabled ? "Enabled" : "Disabled" }}
                      </label>
                      <Switch
                        :model-value="plugin.enabled"
                        @update:model-value="
                          (value) => handleTogglePlugin(plugin.name, value)
                        "
>>>>>>> master
                      />
                    </div>

                    <div class="flex items-center gap-2">
                      <Button
<<<<<<< configuration-with-registry
                          v-if="hasConfiguration(plugin)"
                          size="sm"
                          variant="outline"
                          class="h-8 w-8 p-0"
                          :title="`Configure ${plugin.name}`"
                          @click="handleConfigurePlugin(plugin.name)"
=======
                        size="sm"
                        variant="outline"
                        class="h-8 w-8 p-0"
                        @click="handleConfigurePlugin(plugin.name)"
>>>>>>> master
                      >
                        <Settings class="h-3 w-3" />
                      </Button>

                      <Button
<<<<<<< configuration-with-registry
                          size="sm"
                          variant="destructive"
                          class="h-8 w-8 p-0"
                          :title="`Delete ${plugin.name}`"
                          @click="handleDeletePlugin(plugin.name)"
=======
                        size="sm"
                        variant="destructive"
                        class="h-8 w-8 p-0"
                        @click="handleDeletePlugin(plugin.name)"
>>>>>>> master
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

<<<<<<< configuration-with-registry
        <!-- Separator -->
        <Separator v-if="enabledPlugins.length > 0 && disabledPlugins.length > 0" />

        <!-- Disabled Plugins -->
=======
        <Separator
          v-if="enabledPlugins.length > 0 && disabledPlugins.length > 0"
        />

>>>>>>> master
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
<<<<<<< configuration-with-registry
                v-for="plugin in disabledPlugins"
                :key="plugin.name"
                class="border-red-200 dark:border-red-800 opacity-60"
=======
              v-for="plugin in disabledPlugins"
              :key="plugin.name"
              class="border-red-200 dark:border-red-800 opacity-60"
>>>>>>> master
            >
              <CardContent class="pt-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3 flex-1 min-w-0">
                    <component
<<<<<<< configuration-with-registry
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
=======
                      :is="getStatusIcon(plugin)"
                      :class="['h-4 w-4', getStatusColor(plugin)]"
                    />
                    <div class="flex-1 min-w-0">
                      <h3 class="font-medium text-sm truncate">
                        {{ plugin.name }}
                      </h3>
                      <div class="flex items-center gap-2 mt-1">
                        <Badge variant="outline" class="text-xs h-5 px-2">
                          {{ plugin.version }}
                        </Badge>
                        <Badge variant="destructive" class="text-xs h-5 px-2">
                          disabled
>>>>>>> master
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center gap-3">
                    <div class="flex items-center gap-2">
                      <label class="text-xs font-medium">
<<<<<<< configuration-with-registry
                        {{ plugin.enabled ? 'Enabled' : 'Disabled' }}
                      </label>
                      <Switch
                          :model-value="plugin.enabled"
                          @update:model-value="(value) => handleTogglePlugin(plugin.name, value)"
=======
                        {{ plugin.enabled ? "Enabled" : "Disabled" }}
                      </label>
                      <Switch
                        :model-value="plugin.enabled"
                        @update:model-value="
                          (value) => handleTogglePlugin(plugin.name, value)
                        "
>>>>>>> master
                      />
                    </div>

                    <div class="flex items-center gap-2">
                      <Button
<<<<<<< configuration-with-registry
                          v-if="hasConfiguration(plugin)"
                          size="sm"
                          variant="outline"
                          class="h-8 w-8 p-0"
                          :title="`Configure ${plugin.name}`"
                          @click="handleConfigurePlugin(plugin.name)"
=======
                        size="sm"
                        variant="outline"
                        class="h-8 w-8 p-0"
                        @click="handleConfigurePlugin(plugin.name)"
>>>>>>> master
                      >
                        <Settings class="h-3 w-3" />
                      </Button>

                      <Button
<<<<<<< configuration-with-registry
                          size="sm"
                          variant="destructive"
                          class="h-8 w-8 p-0"
                          :title="`Delete ${plugin.name}`"
                          @click="handleDeletePlugin(plugin.name)"
=======
                        size="sm"
                        variant="destructive"
                        class="h-8 w-8 p-0"
                        @click="handleDeletePlugin(plugin.name)"
>>>>>>> master
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
<<<<<<< configuration-with-registry
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
=======
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
>>>>>>> master
  />
</template>
