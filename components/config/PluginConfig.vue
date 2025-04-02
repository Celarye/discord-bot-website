<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { fetchAvailable } from '~/assets/modules/api';
import type { AvailablePlugins, Plugintype } from '~/assets/types/typelist';
import PluginAvailable from "~/components/config/PluginAvailable.vue";

const fileContent = ref<string | null>(null);
const plugins = ref<Plugintype[]>([]);
const availablePlugins = ref<AvailablePlugins[]>([]);
const selectedVersions = ref<{ [key: string]: string }>({});
const yamlString = ref<string>('');
const showGeneratedYaml = ref<boolean>(false);
const isLoading = ref<boolean>(true);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    // First fetch available plugins
    const data = await fetchAvailable();
    availablePlugins.value = data.plugins || [];

    // Set default selected versions
    availablePlugins.value.forEach(plugin => {
      if (plugin.versions && plugin.versions.length > 0) {
        selectedVersions.value[plugin.name] = plugin.versions[plugin.versions.length - 1];
      }
    });

    // Then try to load existing plugins.yaml
    await loadExistingConfig();
  } catch (err) {
    console.error('Failed to initialize plugin manager:', err);
    error.value = 'Failed to load plugins. Please check the console for details.';
  } finally {
    isLoading.value = false;
  }
});

// Watch for changes in plugins and update YAML
watch(plugins, () => {
  updateYamlString();
}, { deep: true });

async function loadExistingConfig() {
  try {
    // Try to fetch the existing plugins.yaml from the server
    const response = await fetch('/api/plugins/config');

    if (!response.ok) {
      throw new Error(`Failed to load configuration: ${response.statusText}`);
    }

    const yaml = await import('js-yaml');
    const content = await response.text();

    if (content) {
      const yamlData = yaml.load(content);

      if (yamlData && typeof yamlData === 'object') {
        fileContent.value = content;
        plugins.value = yamlData.plugins || [];
        updateYamlString();
      }
    }
  } catch (err) {
    console.warn('Could not load existing configuration:', err);
    // This is not a critical error - just means no config exists yet
  }
}

const openFile = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;

  const file = input.files[0];
  const reader = new FileReader();

  reader.onload = async (e) => {
    try {
      const yaml = await import('js-yaml');
      const content = e.target?.result as string;
      const yamlData = yaml.load(content);

      if (yamlData && typeof yamlData === 'object') {
        fileContent.value = content;
        plugins.value = yamlData.plugins || [];
        updateYamlString();
        error.value = null;
      } else {
        throw new Error('Invalid YAML structure');
      }
    } catch (err) {
      console.error('Error parsing YAML:', err);
      error.value = `Invalid YAML file: ${err.message}`;
      plugins.value = [];
    }
  };

  reader.readAsText(file);
};

const deletePlugin = (pluginName: string) => {
  plugins.value = plugins.value.filter(plugin => plugin.name !== pluginName);
  error.value = null;
};

const addPlugin = (pluginName: string) => {
  const pluginInfo = availablePlugins.value.find(p => p.name === pluginName);
  if (!pluginInfo) return;

  const version = selectedVersions.value[pluginName] ||
      pluginInfo.versions[pluginInfo.versions.length - 1];

  const existingPluginIndex = plugins.value.findIndex(p => p.name === pluginName);

  if (existingPluginIndex !== -1) {
    plugins.value[existingPluginIndex].version = version;
  } else {
    plugins.value.push({ name: pluginName, version });
  }

  error.value = null;
};

const updateSelectedVersion = (pluginName: string, version: string) => {
  selectedVersions.value[pluginName] = version;

  // If this plugin is already in the list, update its version
  const existingPlugin = plugins.value.find(p => p.name === pluginName);
  if (existingPlugin) {
    existingPlugin.version = version;
  }
};

const updateYamlString = async () => {
  try {
    const yaml = await import('js-yaml');
    yamlString.value = yaml.dump({ plugins: plugins.value });
  } catch (err) {
    console.error('Failed to generate YAML:', err);
    yamlString.value = '# Error generating YAML';
  }
};

const saveFile = () => {
  try {
    const blob = new Blob([yamlString.value], { type: 'application/yaml' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'plugins.yaml';
    link.click();
    URL.revokeObjectURL(link.href);
  } catch (err) {
    console.error('Failed to save file:', err);
    error.value = `Failed to save file: ${err.message}`;
  }
};

const saveToServer = async () => {
  try {
    const response = await fetch('/api/plugins/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/yaml',
      },
      body: yamlString.value
    });

    if (!response.ok) {
      throw new Error(`Failed to save configuration: ${response.statusText}`);
    }

    const result = await response.json();
    if (result.success) {
      error.value = null;
      return true;
    } else {
      throw new Error(result.message || 'Unknown error');
    }
  } catch (err) {
    console.error('Failed to save to server:', err);
    error.value = `Failed to save configuration: ${err.message}`;
    return false;
  }
};

const toggleYamlView = () => {
  showGeneratedYaml.value = !showGeneratedYaml.value;
};
</script>

<template>
  <div class="bg-white shadow rounded-lg p-6">
    <div v-if="isLoading" class="flex justify-center py-6">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <div v-else>
      <div v-if="error" class="mb-4 p-3 bg-red-100 border border-red-300 text-red-800 rounded">
        {{ error }}
      </div>

      <div class="mb-6">
        <label class="block mb-2 font-medium">Upload Configuration</label>
        <input
            type="file"
            accept=".yaml, .yml"
            class="border p-2 rounded w-full"
            @change="openFile"
        >
      </div>

      <div class="flex flex-col lg:flex-row lg:space-x-6">
        <div class="w-full lg:w-2/3 mb-6 lg:mb-0">
          <div class="flex justify-between items-center mb-3">
            <h3 class="font-bold text-lg">Current Configuration</h3>
            <button
                class="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                @click="toggleYamlView"
            >
              {{ showGeneratedYaml ? 'Hide YAML' : 'Show YAML' }}
            </button>
          </div>

          <div v-if="showGeneratedYaml" class="mb-4">
            <pre class="p-4 bg-gray-100 border rounded overflow-auto max-h-60 text-sm">{{ yamlString }}</pre>
          </div>

          <PluginList
              :plugins="plugins"
              @delete-plugin="deletePlugin"
          />

          <div class="mt-4 flex flex-wrap gap-2" v-if="plugins.length">
            <button
                class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                @click="saveFile"
            >
              Download YAML
            </button>
            <button
                class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                @click="saveToServer"
            >
              Save Configuration
            </button>
          </div>
        </div>

        <div class="w-full lg:w-1/3">
          <PluginAvailable
              :available-plugins="availablePlugins"
              :selected-versions="selectedVersions"
              @add-plugin="addPlugin"
              @update-version="updateSelectedVersion"
          />
        </div>
      </div>
    </div>
  </div>
</template>