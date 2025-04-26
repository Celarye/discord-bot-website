<script setup lang="ts">
import type { AvailablePlugins } from "~/assets/types/typelist";
import { ref } from "vue";
import PluginAvailableCard from "../molecules/PluginAvailableCard.vue";
import PluginSettingsDialog from "../molecules/PluginSettingsDialog.vue";
import PluginListContainer from "../molecules/PluginList.vue";

const props = defineProps<{
  availablePlugins: AvailablePlugins[];
  selectedVersions: { [key: string]: string };
}>();

const emit = defineEmits<{
  (e: "addPlugin", pluginName: string): void;
  (e: "updateVersion", pluginName: string, version: string): void;
}>();

const selectedPluginName = ref<string | null>(null);
const isDialogOpen = ref(false);
const dialogSelectedVersion = ref('');

const openSettings = (pluginName: string) => {
  selectedPluginName.value = pluginName;
  // Initialize with current selected version
  dialogSelectedVersion.value = props.selectedVersions[pluginName] ||
    (props.availablePlugins.find(p => p.name === pluginName)?.versions?.[0] || '');
  isDialogOpen.value = true;
};

const getSelectedPlugin = () => {
  if (!selectedPluginName.value) return null;
  return props.availablePlugins.find(p => p.name === selectedPluginName.value) || null;
};

const getVersionsForSelectedPlugin = () => {
  const plugin = getSelectedPlugin();
  return plugin?.versions || [];
};

const addPlugin = (pluginName: string) => {
  console.log('Adding plugin:', pluginName);
  emit('addPlugin', pluginName);
  isDialogOpen.value = false;
};

const handleVersionUpdate = (name: string, version: string) => {
  console.log('Updating version:', name, version);
  emit('updateVersion', name, version);
};

const handleDialogVersionUpdate = (version: string) => {
  dialogSelectedVersion.value = version;
  if (selectedPluginName.value) {
    handleVersionUpdate(selectedPluginName.value, version);
  }
};

const handleDialogAdd = () => {
  if (selectedPluginName.value) {
    addPlugin(selectedPluginName.value);
  }
};
</script>

<template>
  <PluginListContainer
    title="Available Plugins"
    :is-empty="availablePlugins.length === 0"
    empty-message="No plugins available at the moment"
  >
    <div class="space-y-3">
      <PluginAvailableCard
        v-for="plugin in availablePlugins"
        :key="plugin.name"
        :name="plugin.name"
        :description="plugin.description || ''"
        :selected-version="selectedVersions[plugin.name] || (plugin.versions && plugin.versions[0] || '')"
        :versions="plugin.versions || []"
        @settings="openSettings"
        @add="addPlugin"
        @update-version="handleVersionUpdate"
      />
    </div>
  </PluginListContainer>

  <PluginSettingsDialog
    :open="isDialogOpen"
    :plugin-name="selectedPluginName"
    :versions="getVersionsForSelectedPlugin()"
    :selected-version="dialogSelectedVersion"
    mode="add"
    @update:open="isDialogOpen = $event"
    @update:selected-version="handleDialogVersionUpdate"
    @add="handleDialogAdd"
  />
</template>