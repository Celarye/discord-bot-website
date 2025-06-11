<!-- ~/components/organisms/PluginAvailableCard.vue -->
<script setup lang="ts">
import { computed } from "vue";
import type { RegistryPlugin } from "~/assets/types/typelist";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Download,
  Check,
  Book,
  Home,
  Github,
  AlertTriangle,
  User,
  Scale,
  Clock
} from "lucide-vue-next";

interface Props {
  plugin: RegistryPlugin;
  selectedVersion?: string;
  isInstalled: boolean;
}

interface Emits {
  (e: "add-plugin", pluginName: string): void;
  (e: "update-version", pluginName: string, version: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();


// Get the latest non-deprecated version
const latestVersion = computed(() => {
  const nonDeprecatedVersions = props.plugin.versions.filter(v => !v.deprecated);
  return nonDeprecatedVersions.length > 0
      ? nonDeprecatedVersions[nonDeprecatedVersions.length - 1]
      : props.plugin.versions[props.plugin.versions.length - 1];
});

// Get currently selected version or default to latest
const currentVersion = computed(() => {
  if (props.selectedVersion) {
    return props.plugin.versions.find(v => v.version === props.selectedVersion);
  }
  return latestVersion.value;
});

// Format date for display
const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return dateString;
  }
};

// Handle version selection
const handleVersionChange = (version: string) => {
  emit("update-version", props.plugin.name, version);
};

// Handle plugin installation
const handleInstall = () => {
  emit("add-plugin", props.plugin.name);
};

// Get version badge variant
const getVersionBadgeVariant = (version: string) => {
  if (version.deprecated) return "destructive";
  return "secondary";
};

// Helper functions for opening external links
const openExternalUrl = (url: string) => {
  if (import.meta.client && url) {
    window.open(url, '_blank');
  }
};
</script>

<template>
  <Card class="relative transition-all hover:shadow-md" :class="{ 'border-orange-200 bg-orange-50/50': plugin.deprecated }">
    <CardHeader class="pb-3">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <CardTitle class="text-lg flex items-center gap-2">
            {{ plugin.name }}
            <Badge v-if="plugin.deprecated" variant="destructive" class="text-xs">
              <AlertTriangle class="h-3 w-3 mr-1" />
              Deprecated
            </Badge>
            <Badge v-if="isInstalled" variant="default" class="text-xs">
              <Check class="h-3 w-3 mr-1" />
              Installed
            </Badge>
          </CardTitle>

          <p class="text-sm text-muted-foreground mt-1">
            {{ plugin.description }}
          </p>

          <!-- Deprecated reason -->
          <div v-if="plugin.deprecated && plugin.deprecatedReason" class="mt-2">
            <Badge variant="outline" class="text-xs text-orange-600 border-orange-200">
              {{ plugin.deprecatedReason }}
            </Badge>
          </div>
        </div>
      </div>

      <!-- Tags -->
      <div v-if="plugin.tags && plugin.tags.length > 0" class="flex flex-wrap gap-1 mt-2">
        <Badge v-for="tag in plugin.tags" :key="tag" variant="outline" class="text-xs">
          {{ tag }}
        </Badge>
      </div>
    </CardHeader>

    <CardContent class="space-y-4">
      <!-- Deprecated Warning Alert -->
      <Alert v-if="plugin.deprecated" variant="destructive">
        <AlertTriangle class="h-4 w-4" />
        <AlertDescription>
          <strong>Deprecated:</strong> {{ plugin.deprecatedReason || 'This plugin is no longer maintained.' }}
        </AlertDescription>
      </Alert>

      <!-- Plugin Metadata -->
      <div class="grid grid-cols-2 gap-3 text-sm">
        <!-- Authors -->
        <div v-if="plugin.authors && plugin.authors.length > 0" class="flex items-center gap-2">
          <User class="h-4 w-4 text-muted-foreground" />
          <span class="text-muted-foreground">
            {{ plugin.authors.length === 1 ? plugin.authors[0].split('<')[0].trim() : `${plugin.authors.length} authors` }}
          </span>
        </div>

        <!-- License -->
        <div v-if="plugin.license" class="flex items-center gap-2">
          <Scale class="h-4 w-4 text-muted-foreground" />
          <span class="text-muted-foreground">{{ plugin.license }}</span>
        </div>

        <!-- Update Time -->
        <div v-if="plugin.updateTime" class="flex items-center gap-2">
          <Clock class="h-4 w-4 text-muted-foreground" />
          <span class="text-muted-foreground">{{ formatDate(plugin.updateTime) }}</span>
        </div>

        <!-- Version Count -->
        <div class="flex items-center gap-2">
          <Badge variant="outline" class="text-xs">
            {{ plugin.versions.length }} version{{ plugin.versions.length !== 1 ? 's' : '' }}
          </Badge>
        </div>
      </div>

      <Separator />

      <!-- Version Selection -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <label class="text-sm font-medium">Version:</label>
          <Select
              :model-value="currentVersion?.version || ''"
              @update:model-value="handleVersionChange"
          >
            <SelectTrigger class="w-32">
              <SelectValue placeholder="Select version" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                  v-for="version in plugin.versions"
                  :key="version.version"
                  :value="version.version"
              >
                <div class="flex items-center gap-2">
                  {{ version.version }}
                  <Badge
                      v-if="version.deprecated"
                      :variant="getVersionBadgeVariant(version)"
                      class="text-xs"
                  >
                    Deprecated
                  </Badge>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Version Info -->
        <div v-if="currentVersion" class="text-xs text-muted-foreground">
          <div class="flex items-center gap-4">
            <span>Bot v{{ currentVersion['compatible-bot-version'] }}+</span>
            <Badge
                v-if="currentVersion.deprecated"
                variant="destructive"
                class="text-xs"
            >
              {{ currentVersion['deprecated-reason'] || 'Deprecated' }}
            </Badge>
          </div>
        </div>
      </div>

      <Separator />

      <!-- Actions -->
      <div class="flex items-center justify-between">
        <!-- External Links -->
        <div class="flex items-center gap-2">
          <Button
              v-if="plugin.homepage"
              variant="ghost"
              size="sm"
              class="p-2"
              title="Homepage"
              @click="openExternalUrl(plugin.homepage)"
          >
            <Home class="h-4 w-4" />
          </Button>

          <Button
              v-if="plugin.documentation"
              variant="ghost"
              size="sm"
              class="p-2"
              title="Documentation"
              @click="openExternalUrl(plugin.documentation)"
          >
            <Book class="h-4 w-4" />
          </Button>

          <Button
              v-if="plugin.repository"
              variant="ghost"
              size="sm"
              class="p-2"
              title="Repository"
              @click="openExternalUrl(plugin.repository)"
          >
            <Github class="h-4 w-4" />
          </Button>
        </div>

        <!-- Install Button -->
        <Button
            :disabled="isInstalled || plugin.deprecated"
            :variant="isInstalled ? 'secondary' : 'default'"
            size="sm"
            class="min-w-24"
            @click="handleInstall"
        >
          <Download v-if="!isInstalled" class="h-4 w-4 mr-2" />
          <Check v-else class="h-4 w-4 mr-2" />
          {{ isInstalled ? 'Installed' : 'Install' }}
        </Button>
      </div>
    </CardContent>
  </Card>
</template>