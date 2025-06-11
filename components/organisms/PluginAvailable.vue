<script setup lang="ts">
import { computed, ref } from "vue";
import type { RegistryPlugin } from "~/assets/types/typelist";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Search, Download } from "lucide-vue-next";
import PluginAvailableCard from "~/components/molecules/PluginAvailableCard.vue";

interface Props {
  availablePlugins: RegistryPlugin[];
  selectedVersions: { [key: string]: string };
  installedPlugins?: string[];
  loading?: boolean;
}

interface Emits {
  (e: "add-plugin", pluginName: string): void;
  (e: "update-version", pluginName: string, version: string): void;
  (e: "refresh-plugins"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const searchQuery = ref("");
const selectedTag = ref<string>("");
const showDeprecated = ref(false);

// Get all unique tags from available plugins
const allTags = computed(() => {
  const tags = new Set<string>();
  props.availablePlugins.forEach(plugin => {
    plugin.tags?.forEach(tag => tags.add(tag));
  });
  return Array.from(tags).sort();
});

// Filter plugins based on search query, selected tag, and deprecation status
const filteredPlugins = computed(() => {
  return props.availablePlugins.filter(plugin => {
    const matchesSearch = !searchQuery.value ||
        plugin.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        plugin.description.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        plugin.tags?.some(tag => tag.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
        plugin.authors?.some(author => author.toLowerCase().includes(searchQuery.value.toLowerCase()));

    const matchesTag = !selectedTag.value ||
        plugin.tags?.includes(selectedTag.value);

    const matchesDeprecation = showDeprecated.value || !plugin.deprecated;

    return matchesSearch && matchesTag && matchesDeprecation;
  });
});

const isPluginInstalled = (pluginName: string) => {
  return props.installedPlugins?.includes(pluginName) || false;
};

const handleAddPlugin = (pluginName: string) => {
  emit("add-plugin", pluginName);
};

const handleVersionChange = (pluginName: string, version: string) => {
  emit("update-version", pluginName, version);
};

const handleRefresh = () => {
  emit("refresh-plugins");
};

// Get plugin statistics
const pluginStats = computed(() => {
  const total = props.availablePlugins.length;
  const deprecated = props.availablePlugins.filter(p => p.deprecated).length;
  const installed = props.installedPlugins?.length || 0;
  const filtered = filteredPlugins.value.length;

  return { total, deprecated, installed, filtered };
});
</script>

<template>
  <Card class="h-fit">
    <CardHeader>
      <div class="flex items-center justify-between">
        <CardTitle class="flex items-center gap-2">
          <Download class="h-5 w-5" />
          Available Plugins
        </CardTitle>
        <div class="flex items-center gap-2">
          <Badge variant="secondary" class="text-xs">
            {{ pluginStats.filtered }}/{{ pluginStats.total }}
          </Badge>
          <button
              :disabled="props.loading"
              class="p-1 hover:bg-gray-100 rounded"
              title="Refresh plugins"
              @click="handleRefresh"
          >
            <Search class="h-4 w-4" :class="{ 'animate-spin': props.loading }" />
          </button>
        </div>
      </div>

      <div class="flex gap-2 text-sm text-muted-foreground">
        <span>{{ pluginStats.installed }} installed</span>
        <span>•</span>
        <span>{{ pluginStats.deprecated }} deprecated</span>
      </div>
    </CardHeader>

    <CardContent class="space-y-4">
      <div class="space-y-3">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
              v-model="searchQuery"
              placeholder="Search plugins by name, description, tags, or authors..."
              class="pl-10"
          />
        </div>

        <div class="flex gap-2">
          <Select v-model="selectedTag">
            <SelectTrigger class="flex-1">
              <SelectValue placeholder="Filter by tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All tags</SelectItem>
              <SelectItem v-for="tag in allTags" :key="tag" :value="tag">
                {{ tag }}
              </SelectItem>
            </SelectContent>
          </Select>

          <div class="flex items-center space-x-2">
            <input
                id="show-deprecated"
                v-model="showDeprecated"
                type="checkbox"
                class="rounded border-gray-300"
            >
            <label
                for="show-deprecated"
                class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Show deprecated
            </label>
          </div>
        </div>
      </div>

      <Separator />

      <div v-if="props.loading" class="text-center py-8 text-muted-foreground">
        <Search class="h-12 w-12 mx-auto mb-2 opacity-50 animate-spin" />
        <p>Loading plugins...</p>
      </div>

      <div v-else class="space-y-4 max-h-96 overflow-y-auto">
        <div v-if="filteredPlugins.length === 0" class="text-center py-8 text-muted-foreground">
          <Search class="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No plugins found</p>
          <p class="text-sm">Try adjusting your search or filter criteria</p>
        </div>

        <PluginAvailableCard
            v-for="plugin in filteredPlugins"
            :key="plugin.name"
            :plugin="plugin"
            :selected-version="selectedVersions[plugin.name]"
            :is-installed="isPluginInstalled(plugin.name)"
            @add-plugin="handleAddPlugin"
            @update-version="handleVersionChange"
        />
      </div>
    </CardContent>
  </Card>
</template>