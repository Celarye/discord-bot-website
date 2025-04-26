<script setup lang="ts">
import type { Plugintype } from "~/assets/types/typelist";
import { computed, onMounted, ref, watch } from "vue";
import { parse as parseYaml } from "yaml";
import PluginConfiguredCard from "../molecules/PluginConfiguredCard.vue";
import PluginSettingsDialog from "../molecules/PluginSettingsDialog.vue";
import PluginListContainer from "../molecules/PluginList.vue";

const props = defineProps<{
  plugins: Plugintype[];
}>();

const localPlugins = ref<Plugintype[]>([]);

watch(
  () => props.plugins,
  (newPlugins) => {
    if (newPlugins && Array.isArray(newPlugins)) {
      localPlugins.value = newPlugins.map(plugin => ({...plugin}));
    } else {
      localPlugins.value = [];
    }
  },
  { immediate: true, deep: true },
);

const emit = defineEmits<{
  (e: "deletePlugin", pluginName: string): void;
  (e: "updatePluginVersion", pluginName: string, newVersion: string): void;
}>();

const selectedPluginName = ref<string | null>(null);
const isDialogOpen = ref(false);
const selectedVersion = ref("");
const pluginsYamlData = ref<never>(null);
const isLoading = ref(false);

const fetchPluginsYaml = async () => {
  try {
    isLoading.value = true;
    const response = await fetch("/plugins.yaml");
    const yamlText = await response.text();
    pluginsYamlData.value = parseYaml(yamlText);
  } catch (error) {
    console.error("Error loading plugins.yaml:", error);
  } finally {
    isLoading.value = false;
  }
};

const getAvailableVersions = (pluginName: string) => {
  if (!pluginsYamlData.value || !pluginsYamlData.value.plugins) return [];

  const pluginInfo = pluginsYamlData.value.plugins.find(
    (p: never) => p.name === pluginName,
  );

  if (pluginInfo && pluginInfo.versions) {
    return pluginInfo.versions;
  }

  const currentPlugin = localPlugins.value.find((p) => p.name === pluginName);
  return currentPlugin ? [currentPlugin.version] : [];
};

const selectedPlugin = computed(() => {
  if (!selectedPluginName.value) return null;
  return (
    localPlugins.value.find(
      (plugin) => plugin.name === selectedPluginName.value,
    ) || null
  );
});

const availableVersions = computed(() => {
  if (!selectedPluginName.value) return [];
  return getAvailableVersions(selectedPluginName.value);
});

const openSettings = (pluginName: string) => {
  selectedPluginName.value = pluginName;

  const plugin = localPlugins.value.find((p) => p.name === pluginName);
  if (plugin) {
    selectedVersion.value = plugin.version;
  }

  isDialogOpen.value = true;
};

const saveSettings = () => {
  if (selectedPlugin.value && selectedVersion.value) {
    // First update local state to immediately reflect the change in UI
    const pluginIndex = localPlugins.value.findIndex(p => p.name === selectedPlugin.value.name);
    if (pluginIndex !== -1) {
      localPlugins.value[pluginIndex].version = selectedVersion.value;
    }

    emit(
      "updatePluginVersion",
      selectedPlugin.value.name,
      selectedVersion.value,
    );
  }
};

const handleDelete = (pluginName: string) => {
  emit('deletePlugin', pluginName);
};

watch(
  () => isDialogOpen.value,
  (newValue) => {
    if (!newValue) {
      selectedPluginName.value = null;
      selectedVersion.value = "";
    }
  },
  { flush: 'post' }
);

onMounted(() => {
  fetchPluginsYaml();
});
</script>

<template>
  <PluginListContainer
    title="Configured Plugins"
    :is-empty="localPlugins.length === 0"
    empty-message="No plugins configured yet. Add plugins from the available list."
  >
    <div class="space-y-2">
      <PluginConfiguredCard
        v-for="plugin in localPlugins"
        :key="plugin.name"
        :name="plugin.name"
        :version="plugin.version"
        @settings="openSettings"
        @delete="handleDelete"
      />
    </div>
  </PluginListContainer>

  <PluginSettingsDialog
    :open="isDialogOpen"
    :plugin-name="selectedPluginName"
    :versions="availableVersions"
    :is-loading="isLoading"
    :selected-version="selectedVersion"
    mode="configure"
    @update:open="isDialogOpen = $event"
    @update:selected-version="selectedVersion = $event"
    @save="saveSettings"
  />
</template>