<script setup lang="ts">
import { fetchAvailable, checkRegistryHealth } from "~/assets/modules/api";
import type { RegistryPlugin, InstalledPlugin } from "~/assets/types/typelist";
import PluginAvailable from "~/components/organisms/PluginAvailable.vue";
import PluginInstalled from "~/components/organisms/PluginInstalled.vue";
import { onMounted, ref, computed } from "vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  registry?: string;
  [key: string]: unknown;
}

const fileContent = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const hasFileSelected = ref<boolean>(false);
const plugins = ref<Record<string, Omit<InstalledPlugin, 'name'>>>({});
const availablePlugins = ref<RegistryPlugin[]>([]);
const selectedVersions = ref<{ [key: string]: string }>({});
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
    }
  } catch (err) {
    console.warn("Could not load existing configuration:", err);
  }
}

const parseYaml = (yamlContent: string): PluginConfig => {
  const lines = yamlContent.split('\n');
  const config: PluginConfig = { plugins: {} };

  let currentPlugin: string | null = null;
  let currentSection: string | null = null;
  let currentSubSection: string | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const indent = line.length - line.trimStart().length;

    if (trimmed === 'plugins:') {
      currentSection = 'plugins';
      continue;
    }

    if (trimmed === 'metadata:') {
      currentSection = 'metadata';
      continue;
    }

    if (currentSection === 'plugins' && indent === 2 && trimmed.endsWith(':')) {
      currentPlugin = trimmed.slice(0, -1);
      config.plugins[currentPlugin] = { version: '', enabled: true };
      continue;
    }

    if (currentPlugin && indent === 4) {
      const [key, ...valueParts] = trimmed.split(':');
      const value = valueParts.join(':').trim().replace(/^["']|["']$/g, '');

      if (key === 'version') {
        config.plugins[currentPlugin].version = value;
      } else if (key === 'enabled') {
        config.plugins[currentPlugin].enabled = value === 'true';
      } else if (key === 'settings' && valueParts.join(':').trim() === '') {
        config.plugins[currentPlugin].settings = {};
        currentSubSection = 'settings';
      } else if (key === 'environment' && valueParts.join(':').trim() === '') {
        config.plugins[currentPlugin].environment = {};
        currentSubSection = 'environment';
      }
    }

    if (currentPlugin && currentSubSection && indent === 6) {
      const [key, ...valueParts] = trimmed.split(':');
      const value = valueParts.join(':').trim().replace(/^["']|["']$/g, '');

      if (currentSubSection === 'settings') {
        if (!config.plugins[currentPlugin].settings) {
          config.plugins[currentPlugin].settings = {};
        }
        let parsedValue: string = value;
        if (value === 'true') parsedValue = true;
        else if (value === 'false') parsedValue = false;
        else if (!isNaN(Number(value)) && value !== '') parsedValue = Number(value);

        config.plugins[currentPlugin].settings![key] = parsedValue;
      } else if (currentSubSection === 'environment') {
        if (!config.plugins[currentPlugin].environment) {
          config.plugins[currentPlugin].environment = {};
        }
        config.plugins[currentPlugin].environment![key] = value;
      }
    }
  }

  return config;
};

const openFile = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) {
    hasFileSelected.value = false;
    return;
  }

  const file = input.files[0];
  hasFileSelected.value = true;
  const reader = new FileReader();

  reader.onload = async (e) => {
    try {
      const content = e.target?.result as string;
      let configData: PluginConfig;

      // check file extension to determine format
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      try {
        if (fileExtension === 'yaml' || fileExtension === 'yml') {
          configData = parseYaml(content);
        } else {
          configData = JSON.parse(content);
        }
      } catch {
        throw new Error(`Invalid ${fileExtension?.toUpperCase() || 'file'} format`);
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
    const response = await fetch(`/api/plugins/config?name=${encodeURIComponent(pluginName)}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to delete plugin: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.success) {
      // reload configuration to reflect changes (including removed dependencies)
      await loadExistingConfig();
      error.value = null;
    } else {
      throw new Error(result.error || "Failed to delete plugin");
    }
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
      plugins.value[pluginName].enabled = !enabled;
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to update plugin: ${response.statusText}`);
    }

    const result = await response.json();
    if (!result.success) {
      plugins.value[pluginName].enabled = !enabled;
      throw new Error(result.error || "Failed to toggle plugin");
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
      settings?: PluginSettings | null;
      environment?: PluginEnvironment | null;
      dependencies?: PluginDependency[] | null;
    } = {};

    if (settings !== undefined) {
      if (settings && Object.keys(settings).length > 0) {
        updates.settings = settings;
      } else {
        updates.settings = null;
      }
    }

    if (environment !== undefined) {
      if (environment && Object.keys(environment).length > 0) {
        updates.environment = environment;
      } else {
        updates.environment = null;
      }
    }

    if (dependencies !== undefined) {
      if (dependencies && dependencies.length > 0) {
        updates.dependencies = dependencies;
      } else {
        updates.dependencies = null;
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
      // Reload the config to get all installed plugins including dependencies
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

const convertToYaml = (): string => {
  try {
    const config: PluginConfig = {
      plugins: plugins.value,
      metadata: {
        lastUpdated: new Date().toISOString(),
        version: "1.0.0"
      }
    };

    let yaml = "plugins:\n";

    Object.entries(config.plugins).forEach(([name, plugin]) => {
      yaml += `  ${name}:\n`;
      yaml += `    version: "${plugin.version}"\n`;
      yaml += `    enabled: ${plugin.enabled}\n`;

      if (plugin.environment && Object.keys(plugin.environment).length > 0) {
        yaml += `    environment:\n`;
        Object.entries(plugin.environment).forEach(([key, value]) => {
          yaml += `      ${key}: ${typeof value === 'string' ? `"${value}"` : value}\n`;
        });
      }

      if (plugin.settings && Object.keys(plugin.settings).length > 0) {
        yaml += `    settings:\n`;
        Object.entries(plugin.settings).forEach(([key, value]) => {
          yaml += `      ${key}: ${typeof value === 'string' ? `"${value}"` : value}\n`;
        });
      }

      if (plugin.dependencies && plugin.dependencies.length > 0) {
        yaml += `    dependencies:\n`;
        plugin.dependencies.forEach((dep) => {
          yaml += `      - name: "${dep.name}"\n`;
          if (dep.version) {
            yaml += `        version: "${dep.version}"\n`;
          }
          if (dep.registry) {
            yaml += `        registry: "${dep.registry}"\n`;
          }
        });
      }
      yaml += "\n";
    });

    if (config.metadata) {
      yaml += "metadata:\n";
      yaml += `  lastUpdated: "${config.metadata.lastUpdated}"\n`;
      yaml += `  version: "${config.metadata.version}"\n`;
    }

    return yaml;
  } catch {
    return "# Error generating YAML";
  }
};

const saveFile = () => {
  try {
    const yamlContent = convertToYaml();
    const blob = new Blob([yamlContent], { type: "application/x-yaml" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "plugins.yaml";
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
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to save configuration: ${response.statusText}`);
    }

    const result = await response.json();
    if (result.success) {
      error.value = null;
      return true;
    } else {
      throw new Error(result.error || "Unknown error");
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
    <CardContent class="p-6">
      <div v-if="isLoading" class="flex justify-center py-6">
        <Loader2 class="h-12 w-12 animate-spin text-primary" />
      </div>

      <div v-else>
        <div class="space-y-4 mb-6">
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

          <Alert
              v-else-if="lastSync"
              variant="default"
              class="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20"
          >
            <CheckCircle class="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription class="text-green-800 dark:text-green-200">
              Registry synced successfully. Last update: {{ new Date(lastSync).toLocaleString() }}
            </AlertDescription>
          </Alert>

          <Button
              variant="outline"
              :disabled="isLoading"
              class="shrink-0"
              @click="refreshRegistry"
          >
            <RefreshCw class="h-4 w-4" />
          </Button>
        </div>

        <div class="mb-6">
          <label class="block mb-3 font-medium">Upload Configuration</label>
          <div class="flex gap-2">
            <div class="relative flex-1">
              <Input
                  ref="fileInput"
                  type="file"
                  accept=".json, .yaml, .yml"
                  :class="[
                    'transition-all duration-200',
                    hasFileSelected
                      ? 'file:hidden text-sm'
                      : 'file:mr-4 file:py-2 file:px-4  file:text-sm file:font-semibold '
                  ]"
                  @change="openFile"
              />
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2">
            <div class="mb-4">
              <div class="flex items-center gap-2 mb-4">
                <Badge v-if="installedPluginsCount > 0" variant="secondary">
                  {{ installedPluginsCount }}
                </Badge>
              </div>

              <PluginInstalled
                  :plugins="plugins"
                  :registry-plugins="registryPluginsMap"
                  @delete-plugin="handleDeletePlugin"
                  @toggle-plugin="togglePlugin"
                  @configure-plugin="handleConfigurePlugin"
              />
            </div>

            <div v-if="installedPluginsCount > 0" class="mt-6 flex flex-wrap gap-2">
              <Button class="flex items-center gap-2" @click="saveFile">
                <Download class="h-4 w-4" />
                Download YAML
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
              <CardContent class="p-6 text-center">
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