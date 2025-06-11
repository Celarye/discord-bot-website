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
  plugins: InstalledPlugin[];
  metadata?: {
    lastUpdated: string;
    version: string;
  };
}

const fileContent = ref<string | null>(null);
const plugins = ref<InstalledPlugin[]>([]);
const availablePlugins = ref<RegistryPlugin[]>([]);
const selectedVersions = ref<{ [key: string]: string }>({});
const jsonString = ref<string>("");
const activeTab = ref<string>("config");
const isLoading = ref<boolean>(true);
const error = ref<string | null>(null);
const isRegistryOnline = ref<boolean>(false);
const lastSync = ref<string | null>(null);

// Computed properties
const installedPluginNames = computed(() =>
    plugins.value.map(p => p.name)
);



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
    // Check registry health
    isRegistryOnline.value = await checkRegistryHealth();

    if (isRegistryOnline.value) {
      // Fetch available plugins from registry
      const data = await fetchAvailable();
      availablePlugins.value = data.plugins || [];

      // Set default selected versions
      availablePlugins.value.forEach((plugin) => {
        if (plugin.versions && plugin.versions.length > 0) {
          // Get latest non-deprecated version
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

    // Load existing configuration
    await loadExistingConfig();
  } catch (err) {
    console.error("Failed to initialize plugin manager:", err);
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
        // No config file exists yet, that's OK
        plugins.value = [];
        updateJsonString();
        return;
      }
      throw new Error(`Failed to load configuration: ${response.statusText}`);
    }

    const config: PluginConfig = await response.json();

    if (config && config.plugins) {
      plugins.value = config.plugins;
      updateJsonString();
    }
  } catch (err) {
    console.warn("Could not load existing configuration:", err);
    // Don't set error here as this might be expected for new installations
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

      // Try to parse as JSON first
      try {
        configData = JSON.parse(content);
      } catch(err) {
        console.error(err)
      }

      if (configData && configData.plugins && Array.isArray(configData.plugins)) {
        fileContent.value = content;
        plugins.value = configData.plugins;
        updateJsonString();
        error.value = null;
      } else {
        new Error("Invalid configuration structure");
      }
    } catch (err) {
      console.error("Error parsing configuration file:", err);
      error.value = `Invalid configuration file: ${err instanceof Error ? err.message : 'Unknown error'}`;
      plugins.value = [];
    }
  };

  reader.readAsText(file);
};

const deletePlugin = async (pluginName: string) => {
  try {
    // Remove from local state
    plugins.value = plugins.value.filter((plugin) => plugin.name !== pluginName);
    error.value = null;

    // Optionally sync with server immediately
    await saveToServer();
  } catch (err) {
    console.error("Error deleting plugin:", err);
    error.value = `Failed to delete plugin: ${err instanceof Error ? err.message : 'Unknown error'}`;
  }
};

const addPlugin = (pluginName: string) => {
  const pluginInfo = availablePlugins.value.find((p) => p.name === pluginName);
  if (!pluginInfo) return;

  const version =
      selectedVersions.value[pluginName] ||
      (pluginInfo.versions && pluginInfo.versions.length > 0
          ? pluginInfo.versions[pluginInfo.versions.length - 1].version
          : "latest");

  const existingPluginIndex = plugins.value.findIndex(
      (p) => p.name === pluginName
  );

  if (existingPluginIndex !== -1) {
    plugins.value[existingPluginIndex] = {
      ...plugins.value[existingPluginIndex],
      version,
      enabled: true
    };
  } else {
    plugins.value.push({
      name: pluginName,
      version,
      enabled: true
    });
  }

  error.value = null;
};

const togglePlugin = async (pluginName: string, enabled: boolean) => {
  try {
    const pluginIndex = plugins.value.findIndex(p => p.name === pluginName);
    if (pluginIndex === -1) return;

    plugins.value[pluginIndex] = {
      ...plugins.value[pluginIndex],
      enabled
    };

    // Sync with server
    await saveToServer();
  } catch (err) {
    console.error("Error toggling plugin:", err);
    error.value = `Failed to toggle plugin: ${err instanceof Error ? err.message : 'Unknown error'}`;
  }
};

const configurePlugin = (pluginName: string) => {
  console.log("Configure plugin:", pluginName);
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
  } catch (err) {
    console.error("Failed to generate JSON:", err);
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
    console.error("Failed to save file:", err);
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
    console.error("Failed to save to server:", err);
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
        <!-- Status Alerts -->
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
                  <Badge v-if="plugins.length > 0" variant="secondary" class="ml-2">
                    {{ plugins.length }}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="json">JSON Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="config">
                <PluginInstalled
                    :plugins="plugins"
                    @delete-plugin="deletePlugin"
                    @toggle-plugin="togglePlugin"
                    @configure-plugin="configurePlugin"
                />
              </TabsContent>

              <TabsContent value="json">
                <pre class="p-4 bg-muted rounded overflow-auto max-h-96 text-sm font-mono">{{ jsonString }}</pre>
              </TabsContent>
            </Tabs>

            <div v-if="plugins.length" class="mt-4 flex flex-wrap gap-2">
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