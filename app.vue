<script setup lang="ts">
import { ref } from 'vue';
import yaml from 'js-yaml';
import {fetchAvailable} from "assets/modlules/api";
import type {AvailablePlugins, Plugintype} from "assets/types/typelist";

const fileContent = ref<string | null>(null);
const plugins = ref<Plugintype[]>([]);


const availablePlugins = ref<AvailablePlugins[]>();


fetchAvailable().then(e => availablePlugins.value = e.plugins);


const selectedVersions = ref<{ [key: string]: string }>({});




const openFile = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;

  const file = input.files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const yamlData = yaml.load(e.target?.result as string);
      fileContent.value = yamlData
      plugins.value = yamlData.plugins
    } catch (error: Error) {
      fileContent.value = 'Invalid YAML file' + error.message;
      plugins.value = [];
    }
  };

  reader.readAsText(file);
};

const deletePlugin = (pluginName: string) => {
  plugins.value = plugins.value.filter(plugin => plugin.name !== pluginName);
  fileContent.value = JSON.stringify({ plugins: plugins.value }, null, 2);
};

const addPlugin = (pluginName: string) => {
  const version = selectedVersions.value[pluginName] || availablePlugins.value.find(p => p.name === pluginName)?.versions[availablePlugins.value.find(p => p.name === pluginName).versions.length-1];
  if (!version) return;

  const existingPluginIndex = plugins.value.findIndex(p => p.name === pluginName);
  if (existingPluginIndex !== -1) {
    plugins.value[existingPluginIndex].version = version;
  } else {
    plugins.value.push({ name: pluginName, version });
  }
  fileContent.value = JSON.stringify({ plugins: plugins.value }, null, 2);
};

const saveFile = () => {
  const yamlString = yaml.dump({ plugins: plugins.value });
  const blob = new Blob([yamlString], { type: 'application/yaml' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'plugins.yaml';
  link.click();
  URL.revokeObjectURL(link.href);
};
</script>

<template>
  <div class="p-4 flex">
    <div class="w-2/3">
      <input type="file" accept=".yaml, .yml" class="mb-4" @change="openFile" >
      <pre v-if="fileContent" class="p-2 bg-gray-100 border rounded">{{ fileContent }}</pre>

      <div v-if="plugins.length" class="mt-4">
        <button class="p-1 bg-blue-600 text-white rounded" @click="saveFile">Save</button>
        <h3 class="font-bold">Plugins</h3>
        <div v-for="plugin in plugins" :key="plugin.name" class="p-2 mt-2 bg-blue-100 border rounded flex justify-between">
          <div>
            <p>{{ plugin.name }}</p>Version: {{ plugin.version }}
          </div>
          <button class="p-1 bg-red-500 text-white rounded" @click="deletePlugin(plugin.name)">Delete</button>
        </div>

      </div>
    </div>

    <div class="w-1/3 p-4">
      <h3 class="font-bold">Available Plugins</h3>
      <div v-for="plugin in availablePlugins" :key="plugin.name" class="p-2 mt-2 bg-gray-200 border rounded">
        <p>{{ plugin.name }}</p>
        <select v-model="selectedVersions[plugin.name]" class="ml-2">
          <option v-for="version in plugin.versions" :key="version" :value="version">
            {{ version }}
          </option>
        </select>
        <p>{{ plugin.description}}</p>
        <button class="p-1 bg-green-500 text-white rounded" @click="addPlugin(plugin.name)">Add</button>
      </div>
    </div>
  </div>
</template>
