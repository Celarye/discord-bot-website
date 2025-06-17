<script setup lang="ts">
import type { Plugintype } from "~/assets/types/typelist";
import PluginListContainer from "../molecules/PluginList.vue";
import DashboardPluginCard from "./DashboardPluginCard.vue";

const props = defineProps<{
  plugins: Plugintype[];
}>();

const localPlugins = ref<Plugintype[]>([]);

watch(
  () => props.plugins,
  (newPlugins) => {
    if (newPlugins && Array.isArray(newPlugins)) {
      localPlugins.value = newPlugins.map((plugin) => ({ ...plugin }));
    } else {
      localPlugins.value = [];
    }
  },
  { immediate: true, deep: true },
);
</script>

<template>
  <PluginListContainer
    title="Configured Plugins"
    :is-empty="localPlugins.length === 0"
    empty-message="No plugins configured yet. Please add plugins in the configuration page."
  >
    <div class="space-y-2">
      <DashboardPluginCard
        v-for="plugin in localPlugins"
        :key="plugin.name"
        :name="plugin.name"
        :version="plugin.version"
        :enabled="plugin.enabled"
      />
    </div>
  </PluginListContainer>
</template>
