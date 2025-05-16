<script setup lang="ts">
import { fetchAvailable } from "~/assets/modules/api";
import type { AvailablePlugins, Plugintype } from "~/assets/types/typelist";
import PluginAvailable from "~/components/organisms/PluginAvailable.vue";
import PluginList from "~/components/organisms/PluginInstalled.vue";
import { onMounted, ref, watch } from "vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-vue-next";

const fileContent = ref<string | null>(null);
const plugins = ref<Plugintype[]>([]);
const availablePlugins = ref<AvailablePlugins[]>([]);
const selectedVersions = ref<{ [key: string]: string }>({});
const yamlString = ref<string>("");
const activeTab = ref<string>("config");
const isLoading = ref<boolean>(true);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    const data = await fetchAvailable();
    availablePlugins.value = data.plugins || [];

    availablePlugins.value.forEach((plugin) => {
      if (plugin.versions && plugin.versions.length > 0) {
        selectedVersions.value[plugin.name] =
          plugin.versions[plugin.versions.length - 1];
      }
    });

    await loadExistingConfig();
  } catch (err) {
    console.error("Failed to initialize plugin manager:", err);
    error.value =
      "Failed to load plugins. Please check the console for details.";
  } finally {
    isLoading.value = false;
  }
});

watch(
  plugins,
  () => {
    updateYamlString();
  },
  { deep: true },
);

async function loadExistingConfig() {
  try {

    const response = await fetch("/api/plugins/config");

    if (!response.ok) {
      new Error(`Failed to load configuration: ${response.statusText}`);
    }

    const yaml = await import("js-yaml");
    const content = await response.text();

    if (content) {
      const yamlData = yaml.load(content);

      if (yamlData && typeof yamlData === "object") {
        fileContent.value = content;
        plugins.value = yamlData.plugins || [];
        await updateYamlString();
      }
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
      const yaml = await import("js-yaml");
      const content = e.target?.result as string;
      const yamlData = yaml.load(content);

      if (yamlData && typeof yamlData === "object") {
        fileContent.value = content;
        plugins.value = yamlData.plugins || [];
        await updateYamlString();
        error.value = null;
      } else {
        new Error("Invalid YAML structure");
      }
    } catch (err) {
      console.error("Error parsing YAML:", err);
      error.value = `Invalid YAML file: ${err.message}`;
      plugins.value = [];
    }
  };

  reader.readAsText(file);
};

const deletePlugin = (pluginName: string) => {
  plugins.value = plugins.value.filter((plugin) => plugin.name !== pluginName);
  error.value = null;
};

const addPlugin = (pluginName: string) => {
  const pluginInfo = availablePlugins.value.find((p) => p.name === pluginName);
  if (!pluginInfo) return;

  const version =
    selectedVersions.value[pluginName] ||
    pluginInfo.versions[pluginInfo.versions.length - 1];

  const existingPluginIndex = plugins.value.findIndex(
    (p) => p.name === pluginName,
  );

  if (existingPluginIndex !== -1) {
    plugins.value[existingPluginIndex].version = version;
  } else {
    plugins.value.push({ name: pluginName, version });
  }

  error.value = null;
};

const updateSelectedVersion = (pluginName: string, version: string) => {
  selectedVersions.value[pluginName] = version;

};

const updateYamlString = async () => {
  try {
    const yaml = await import("js-yaml");
    yamlString.value = yaml.dump({ plugins: plugins.value });
  } catch (err) {
    console.error("Failed to generate YAML:", err);
    yamlString.value = "# Error generating YAML";
  }
};

const saveFile = () => {
  try {
    const blob = new Blob([yamlString.value], { type: "application/yaml" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "plugins.yaml";
    link.click();
    URL.revokeObjectURL(link.href);
  } catch (err) {
    console.error("Failed to save file:", err);
    error.value = `Failed to save file: ${err.message}`;
  }
};

const saveToServer = async () => {
  try {
    const response = await fetch("/api/plugins/config", {
      method: "POST",
      headers: {
        "Content-Type": "application/yaml",
      },
      body: yamlString.value,
    });

    if (!response.ok) {
      new Error(`Failed to save configuration: ${response.statusText}`);
    }

    const result = await response.json();
    if (result.success) {
      error.value = null;
      return true;
    } else {
      new Error(result.message || "Unknown error");
    }
  } catch (err) {
    console.error("Failed to save to server:", err);
    error.value = `Failed to save configuration: ${err.message}`;
    return false;
  }
};
</script>

<template>
  <Card>
    <CardContent class="pt-6">
      <div v-if="isLoading" class="flex justify-center py-6">
        <Loader2 class="h-12 w-12 animate-spin text-primary" />
      </div>

      <div v-else>
        <Alert
          v-if="error"
          variant="destructive"
          class="mb-4"
        >
          <AlertDescription>{{ error }}</AlertDescription>
        </Alert>

        <div class="mb-6">
          <label class="block mb-2 font-medium">Upload Configuration</label>
          <Input
            type="file"
            accept=".yaml, .yml"
            class="w-full"
            @change="openFile"
          />
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2">
            <Tabs v-model="activeTab" default-value="config" class="mb-3">
              <TabsList class="grid grid-cols-2">
                <TabsTrigger value="config">Configuration</TabsTrigger>
                <TabsTrigger value="yaml">YAML Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="config">
                <PluginList :plugins="plugins" @delete-plugin="deletePlugin" />
              </TabsContent>
              <TabsContent value="yaml">
                <pre class="p-4 bg-muted rounded overflow-auto max-h-60 text-sm">{{ yamlString }}</pre>
              </TabsContent>
            </Tabs>

            <div v-if="plugins.length" class="mt-4 flex flex-wrap gap-2">
              <Button variant="default" @click="saveFile">
                Download YAML
              </Button>
              <Button variant="default" @click="saveToServer">
                Save Configuration
              </Button>
            </div>
          </div>

          <div>
            <PluginAvailable
              :available-plugins="availablePlugins"
              :selected-versions="selectedVersions"
              @add-plugin="addPlugin"
              @update-version="updateSelectedVersion"
            />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>