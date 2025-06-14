<script setup lang="ts">
import { fetchAvailable, checkRegistryHealth } from "~/assets/modules/api";
import type { RegistryPlugin, InstalledPlugin } from "~/assets/types/typelist";
import PluginAvailable from "~/components/organisms/PluginAvailable.vue";
import PluginInstalled from "~/components/organisms/PluginInstalled.vue";
import { onMounted, ref, watch, computed } from "vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Download,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  WifiOff
} from "lucide-vue-next";

interface PluginConfig {
  plugins: Record<string, Omit<InstalledPlugin, 'name'>>;
  metadata?: {
    lastUpdated: string;
    version: string;
  };
}

interface PluginSettings {
  [key: string]: string | number | boolean | null | undefined;
}

interface PluginEnvironment {
  [key: string]: string | number | boolean | null | undefined;
}

interface PluginDependency {
  name: string;
  version?: string;
  [key: string]: unknown;
}

const fileContent = ref<string | null>(null);
const plugins = ref<Record<string, Omit<InstalledPlugin, 'name'>>>({});
const availablePlugins = ref<RegistryPlugin[]>([]);
const selectedVersions = ref<{ [key: string]: string }>({});
const jsonString = ref<string>("");
const activeTab = ref<string>("config");
const isLoading = ref<boolean>(true);
const error = ref<string | null>(null);
const isRegistryOnline = ref<boolean>(false);
const lastSync = ref<string | null>(null);

const installedPluginNames = computed(() => Object.keys(plugins.value));

const registryPluginsMap = computed(() => {
  const map: Record<string, RegistryPlugin> = {};
  availablePlugins.value.forEach(plugin => {
    map[plugin.name] = plugin;
  });
  return map;
});

const installedPluginsCount = computed(() => Object.keys(plugins.value).length);

onMounted(async () => {
  await initializePluginManager();
});

watch(
    plugins,
    () => {
      updateJsonString();
    },
    { deep: true }
);

async function initializePluginManager() {
  isLoading.value = true;
  error.value = null;

  try {
    isRegistryOnline.value = await checkRegistryHealth();

    if (isRegistryOnline.value) {
      const data = await fetchAvailable();
      availablePlugins.value = data.plugins || [];

      availablePlugins.value.forEach((plugin) => {
        if (plugin.versions && plugin.versions.length > 0) {
          const nonDeprecated = plugin.versions.filter(v => !v.deprecated);
          const latestVersion = nonDeprecated.length > 0
              ? nonDeprecated[nonDeprecated.length - 1]
              : plugin.versions[plugin.versions.length - 1];

          selectedVersions.value[plugin.name] = latestVersion.version;
        }
      });

      lastSync.value = new Date().toISOString();
    } else {
      error.value = "Registry is offline. You can still manage installed plugins.";
    }

    await loadExistingConfig();
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to initialize plugin manager";
  } finally {
    isLoading.value = false;
  }
}

async function loadExistingConfig() {
  try {
    const response = await fetch("/api/plugins/config");

    if (!response.ok) {
      if (response.status === 404) {
        plugins.value = {};
        updateJsonString();
        return;
      }
      throw new Error(`Failed to load configuration: ${response.statusText}`);
    }

    const config: PluginConfig = await response.json();

    if (config && config.plugins) {
      if (Array.isArray(config.plugins)) {
        const pluginsObject: Record<string, Omit<InstalledPlugin, 'name'>> = {};
        config.plugins.forEach((plugin: InstalledPlugin) => {
          if (plugin.name) {
            const { name, ...pluginData } = plugin;
            pluginsObject[name] = pluginData;
          }
        });
        plugins.value = pluginsObject;
      } else {
        plugins.value = config.plugins;
      }
      updateJsonString();
    }
  } catch (err) {
    console.warn("Could not load existing configuration:", err);
  }
}

const openFile = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;

  const file = input.files[0];
  const reader = new FileReader();

  reader.onload = async (e) => {
    try {
      const content = e.target?.result as string;
      let configData: PluginConfig;

      try {
        configData = JSON.parse(content);
      } catch {
        throw new Error("Invalid JSON format");
      }

      if (configData && configData.plugins) {
        fileContent.value = content;

        if (Array.isArray(configData.plugins)) {
          const pluginsObject: Record<string, Omit<InstalledPlugin, 'name'>> = {};
          configData.plugins.forEach((plugin: InstalledPlugin) => {
            if (plugin.name) {
              const { name, ...pluginData } = plugin;
              pluginsObject[name] = pluginData;
            }
          });
          plugins.value = pluginsObject;
        } else {
          plugins.value = configData.plugins;
        }

        updateJsonString();
        error.value = null;
      } else {
        throw new Error("Invalid configuration structure");
      }
    } catch (err) {
      error.value = `Invalid configuration file: ${err instanceof Error ? err.message : 'Unknown error'}`;
      plugins.value = {};
    }
  };

  reader.readAsText(file);
};

const deletePlugin = async (pluginName: string) => {
  try {
    const { [pluginName]: _, ...rest } = plugins.value;
    plugins.value = rest;

    error.value = null;
    await saveToServer();
  } catch (err) {
    error.value = `Failed to delete plugin: ${err instanceof Error ? err.message : 'Unknown error'}`;
  }
};

const togglePlugin = async (pluginName: string, enabled: boolean) => {
  try {
    if (!plugins.value[pluginName]) return;

    plugins.value[pluginName] = {
      ...plugins.value[pluginName],
      enabled
    };

    const response = await fetch("/api/plugins/config", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pluginName: pluginName,
        updates: { enabled }
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update plugin: ${response.statusText}`);
    }

    error.value = null;
  } catch (err) {
    error.value = `Failed to toggle plugin: ${err instanceof Error ? err.message : 'Unknown error'}`;
  }
};

const configurePlugin = async (
    pluginName: string,
    withSettings?: boolean,
    settings?: PluginSettings,
    environment?: PluginEnvironment,
    dependencies?: PluginDependency[]
) => {
  try {
    if (!plugins.value[pluginName]) {
      error.value = `Plugin "${pluginName}" not found`;
      return;
    }

    const updates: {
      settings?: PluginSettings;
      environment?: PluginEnvironment;
      dependencies?: PluginDependency[];
    } = {};

    if (settings !== undefined) {
      if (settings && Object.keys(settings).length > 0) {
        updates.settings = settings;
      } else {
        updates.settings = undefined;
      }
    }

    if (environment !== undefined) {
      if (environment && Object.keys(environment).length > 0) {
        updates.environment = environment;
      } else {
        updates.environment = undefined;
      }
    }

    if (dependencies !== undefined) {
      if (dependencies && dependencies.length > 0) {
        updates.dependencies = dependencies;
      } else {
        updates.dependencies = undefined;
      }
    }

    const response = await fetch("/api/plugins/config", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pluginName: pluginName,
        updates: updates
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to update plugin: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.success) {
      if (result.plugin) {
        const { name, ...pluginData } = result.plugin;
        plugins.value[pluginName] = pluginData;
      } else {
        await loadExistingConfig();
      }
      error.value = null;
    } else {
      throw new Error(result.error || "Unknown error occurred");
    }
  } catch (err) {
    error.value = `Failed to configure plugin: ${err instanceof Error ? err.message : 'Unknown error'}`;
    await loadExistingConfig();
  }
};

const addPlugin = async (
    pluginName: string,
    withSettings?: boolean,
    settings?: PluginSettings,
    environment?: PluginEnvironment,
    dependencies?: PluginDependency[],
    version?: string
) => {
  try {
    const pluginInfo = availablePlugins.value.find((p) => p.name === pluginName);
    if (!pluginInfo) {
      error.value = `Plugin "${pluginName}" not found in registry`;
      return;
    }

    const selectedVersion = version ||
        selectedVersions.value[pluginName] ||
        (pluginInfo.versions && pluginInfo.versions.length > 0
            ? pluginInfo.versions[pluginInfo.versions.length - 1].version
            : "latest");

    if (plugins.value[pluginName]) {
      error.value = `Plugin "${pluginName}" is already installed`;
      return;
    }

    const requestBody = {
      action: 'add-plugin',
      plugin: {
        name: pluginName,
        version: selectedVersion,
        enabled: true,
        settings: settings && Object.keys(settings).length > 0 ? settings : undefined,
        environment: environment && Object.keys(environment).length > 0 ? environment : undefined,
        dependencies: dependencies && dependencies.length > 0 ? dependencies : undefined
      }
    };

    const response = await fetch("/api/plugins/config", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to install plugin: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.success) {
      await loadExistingConfig();
      error.value = null;
    } else {
      throw new Error(result.error || "Unknown error occurred");
    }
  } catch (err) {
    error.value = `Failed to install plugin: ${err instanceof Error ? err.message : 'Unknown error'}`;
  }
};

const handleConfigurePlugin = (
    pluginName: string,
    withSettings?: boolean,
    settings?: PluginSettings,
    environment?: PluginEnvironment,
    dependencies?: PluginDependency[]
) => {
  configurePlugin(pluginName, withSettings, settings, environment, dependencies);
};

const handleDeletePlugin = (pluginName: string) => {
  deletePlugin(pluginName);
};

const updateSelectedVersion = (pluginName: string, version: string) => {
  selectedVersions.value[pluginName] = version;
};

const updateJsonString = () => {
  try {
    const config: PluginConfig = {
      plugins: plugins.value,
      metadata: {
        lastUpdated: new Date().toISOString(),
        version: "1.0.0"
      }
    };
    jsonString.value = JSON.stringify(config, null, 2);
  } catch {
    jsonString.value = "// Error generating JSON";
  }
};

const saveFile = () => {
  try {
    const blob = new Blob([jsonString.value], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "plugins.json";
    link.click();
    URL.revokeObjectURL(link.href);
  } catch (err) {
    error.value = `Failed to save file: ${err instanceof Error ? err.message : 'Unknown error'}`;
  }
};

const saveToServer = async (): Promise<boolean> => {
  try {
    const config: PluginConfig = {
      plugins: plugins.value,
      metadata: {
        lastUpdated: new Date().toISOString(),
        version: "1.0.0"
      }
    };

    const response = await fetch("/api/plugins/config", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      throw new Error(`Failed to save configuration: ${response.statusText}`);
    }

    const result = await response.json();
    if (result.success) {
      error.value = null;
      return true;
    } else {
      throw new Error(result.message || "Unknown error");
    }
  } catch (err) {
    error.value = `Failed to save configuration: ${err instanceof Error ? err.message : 'Unknown error'}`;
    return false;
  }
};

const refreshRegistry = async () => {
  isLoading.value = true;
  await initializePluginManager();
};
</script>

<template>
  <Card>
    <CardContent class="pt-6">
      <div v-if="isLoading" class="flex justify-center py-6">
        <Loader2 class="h-12 w-12 animate-spin text-primary" />
      </div>

      <div v-else>
        <div class="space-y-3 mb-6">
          <Alert v-if="error" variant="destructive">
            <AlertTriangle class="h-4 w-4" />
            <AlertDescription>{{ error }}</AlertDescription>
          </Alert>

          <Alert v-if="!isRegistryOnline" variant="destructive">
            <WifiOff class="h-4 w-4" />
            <AlertDescription>
              Registry is offline. Available plugins cannot be loaded, but you can still manage installed plugins.
            </AlertDescription>
          </Alert>

          <Alert v-else-if="lastSync" variant="default" class="border-green-200 dark:border-green-800">
            <CheckCircle class="h-4 w-4 text-green-600" />
            <AlertDescription>
              Registry synced successfully. Last update: {{ new Date(lastSync).toLocaleString() }}
            </AlertDescription>
          </Alert>
        </div>

        <div class="mb-6">
          <label class="block mb-2 font-medium">Upload Configuration</label>
          <div class="flex gap-2">
            <Input
                type="file"
                accept=".json, .yaml, .yml"
                class="flex-1"
                @change="openFile"
            />
            <Button
                variant="outline"
                :disabled="isLoading"
                class="shrink-0"
                @click="refreshRegistry"
            >
              <RefreshCw class="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2">
            <Tabs v-model="activeTab" default-value="config" class="mb-3">
              <TabsList class="grid grid-cols-2">
                <TabsTrigger value="config">
                  Configuration
                  <Badge v-if="installedPluginsCount > 0" variant="secondary" class="ml-2">
                    {{ installedPluginsCount }}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="json">JSON Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="config">
                <PluginInstalled
                    :plugins="plugins"
                    :registry-plugins="registryPluginsMap"
                    @delete-plugin="handleDeletePlugin"
                    @toggle-plugin="togglePlugin"
                    @configure-plugin="handleConfigurePlugin"
                />
              </TabsContent>

              <TabsContent value="json">
                <pre class="p-4 bg-muted rounded overflow-auto max-h-96 text-sm font-mono">{{ jsonString }}</pre>
              </TabsContent>
            </Tabs>

            <div v-if="installedPluginsCount > 0" class="mt-4 flex flex-wrap gap-2">
              <Button class="flex items-center gap-2" @click="saveFile">
                <Download class="h-4 w-4" />
                Download JSON
              </Button>
              <Button class="flex items-center gap-2" @click="saveToServer">
                <Save class="h-4 w-4" />
                Save Configuration
              </Button>
            </div>
          </div>

          <div>
            <PluginAvailable
                v-if="isRegistryOnline"
                :available-plugins="availablePlugins"
                :selected-versions="selectedVersions"
                :installed-plugins="installedPluginNames"
                @add-plugin="addPlugin"
                @update-version="updateSelectedVersion"
            />

            <Card v-else class="opacity-60">
              <CardContent class="pt-6 text-center">
                <WifiOff class="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p class="font-medium">Registry Offline</p>
                <p class="text-sm text-muted-foreground">Cannot load available plugins</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>