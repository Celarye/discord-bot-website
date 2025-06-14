<script setup lang="ts">
import { computed, ref } from "vue";
import type { RegistryPlugin } from "~/assets/types/typelist";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PluginSettingsDialog from "~/components/molecules/PluginSettingsDialog.vue";
import {
  Download,
  Check,
  Book,
  Home,
  Github,
  AlertTriangle,
  User,
  Scale,
  Clock,
  Settings
} from "lucide-vue-next";

// Define specific types for better type safety
interface PluginDependency {
  name: string;
  version?: string;
  [key: string]: unknown;
}

interface Props {
  plugin: RegistryPlugin;
  selectedVersion?: string;
  isInstalled: boolean;
}

interface Emits {
  (e: "add-plugin", pluginName: string, withSettings?: boolean, settings?: Record<string, unknown>, environment?: Record<string, unknown>, dependencies?: PluginDependency[], version?: string): void;
  (e: "update-version", pluginName: string, version: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const showSettingsDialog = ref(false);
const dialogSelectedVersion = ref('');

const latestVersion = computed(() => {
  const nonDeprecatedVersions = props.plugin.versions?.filter(v => !v.deprecated) || [];
  return nonDeprecatedVersions.length > 0
      ? nonDeprecatedVersions[nonDeprecatedVersions.length - 1]
      : props.plugin.versions?.[props.plugin.versions.length - 1] || {
    version: props.plugin.version || 'v1.0.0',
    'compatible-bot-version': props.plugin['compatible-bot-version'] || '3',
    deprecated: props.plugin['version-deprecated'] || false,
    'deprecated-reason': ''
  };
});

const currentVersion = computed(() => {
  if (props.selectedVersion && props.plugin.versions) {
    return props.plugin.versions.find(v => v.version === props.selectedVersion);
  }
  if (!props.plugin.versions) {
    return {
      version: props.plugin.version || 'v1.0.0',
      'compatible-bot-version': props.plugin['compatible-bot-version'] || '3',
      deprecated: props.plugin['version-deprecated'] || false,
      'deprecated-reason': ''
    };
  }
  return latestVersion.value;
});

const availableVersions = computed(() => {
  if (props.plugin.versions) {
    return props.plugin.versions.map(v => v.version);
  }
  return [props.plugin.version || 'v1.0.0'];
});

const hasSettings = computed(() => {
  return props.plugin.settings &&
      props.plugin.settings.properties &&
      Object.keys(props.plugin.settings.properties).length > 0;
});

const hasEnvironment = computed(() => {
  return props.plugin.environment &&
      props.plugin.environment.properties &&
      Object.keys(props.plugin.environment.properties).length > 0;
});

const hasDependencies = computed(() => {
  return props.plugin.dependencies && props.plugin.dependencies.length > 0;
});

const needsConfiguration = computed(() => {
  return hasSettings.value || hasEnvironment.value || hasDependencies.value;
});

const isPluginDeprecated = computed(() => {
  return props.plugin.deprecated || props.plugin['plugin-deprecated'] || false;
});

const deprecationReason = computed(() => {
  return props.plugin.deprecatedReason || props.plugin['deprecation-reason'] || 'This plugin is no longer maintained.';
});

const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return dateString;
  }
};

const handleVersionChange = (version: string): void => {
  emit("update-version", props.plugin.name, version);
};

const handleDialogVersionChange = (version: string): void => {
  dialogSelectedVersion.value = version;
};

const handleSimpleInstall = (): void => {
  emit("add-plugin", props.plugin.name, false, undefined, undefined, props.plugin.dependencies, currentVersion.value?.version);
};

const handleInstallWithSettings = (): void => {
  dialogSelectedVersion.value = currentVersion.value?.version || latestVersion.value.version;
  showSettingsDialog.value = true;
};

const handleSettingsDialogSubmit = (settingsData?: Record<string, unknown>, environmentData?: Record<string, unknown>): void => {
  const hasData = (settingsData && Object.keys(settingsData).length > 0) ||
      (environmentData && Object.keys(environmentData).length > 0);

  emit("add-plugin", props.plugin.name, hasData, settingsData, environmentData, props.plugin.dependencies, dialogSelectedVersion.value);

  if (dialogSelectedVersion.value !== currentVersion.value?.version) {
    emit("update-version", props.plugin.name, dialogSelectedVersion.value);
  }

  showSettingsDialog.value = false;
};

const getVersionBadgeVariant = (version: { deprecated?: boolean; [key: string]: unknown }) => {
  if (version.deprecated) return "destructive";
  return "secondary";
};

const openExternalUrl = (url: string): void => {
  if (import.meta.client && url) {
    window.open(url, '_blank');
  }
};
</script>

<template>
  <Card class="relative transition-all hover:shadow-md" :class="{ 'border-orange-200 bg-orange-50/50': isPluginDeprecated }">
    <CardHeader class="pb-3">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <CardTitle class="text-lg flex items-center gap-2">
            {{ plugin.name }}
            <Badge v-if="isPluginDeprecated" variant="destructive" class="text-xs">
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

          <div v-if="isPluginDeprecated" class="mt-2">
            <Badge variant="outline" class="text-xs text-orange-600 border-orange-200">
              {{ deprecationReason }}
            </Badge>
          </div>
        </div>
      </div>

      <div v-if="plugin.tags && plugin.tags.length > 0" class="flex flex-wrap gap-1 mt-2">
        <Badge v-for="tag in plugin.tags" :key="tag" variant="outline" class="text-xs">
          {{ tag }}
        </Badge>
      </div>
    </CardHeader>

    <CardContent class="space-y-4">
      <Alert v-if="isPluginDeprecated" variant="destructive">
        <AlertTriangle class="h-4 w-4" />
        <AlertDescription>
          <strong>Deprecated:</strong> {{ deprecationReason }}
        </AlertDescription>
      </Alert>

      <div class="grid grid-cols-2 gap-3 text-sm">
        <div v-if="plugin.authors && plugin.authors.length > 0" class="flex items-center gap-2">
          <User class="h-4 w-4 text-muted-foreground" />
          <span class="text-muted-foreground">
            {{ plugin.authors.length === 1 ? plugin.authors[0].split('<')[0].trim() : `${plugin.authors.length} authors` }}
          </span>
        </div>

        <div v-if="plugin.license" class="flex items-center gap-2">
          <Scale class="h-4 w-4 text-muted-foreground" />
          <span class="text-muted-foreground">{{ plugin.license }}</span>
        </div>

        <div v-if="plugin.updateTime || plugin['update-time']" class="flex items-center gap-2">
          <Clock class="h-4 w-4 text-muted-foreground" />
          <span class="text-muted-foreground">{{ formatDate(plugin.updateTime || plugin['update-time']) }}</span>
        </div>

        <div class="flex items-center gap-2">
          <Badge variant="outline" class="text-xs">
            {{ (plugin.versions?.length || 1) }} version{{ (plugin.versions?.length || 1) !== 1 ? 's' : '' }}
          </Badge>
        </div>
      </div>

      <div v-if="hasDependencies" class="p-3 bg-blue-50 rounded-md border border-blue-200">
        <div class="flex items-center gap-2 text-sm">
          <Download class="h-4 w-4 text-blue-600" />
          <span class="font-medium text-blue-800">Dependencies:</span>
        </div>
        <div class="mt-1 text-xs text-blue-700">
          {{ plugin.dependencies?.map(dep => dep.name).join(', ') }} will be installed automatically
        </div>
      </div>

      <div v-if="hasSettings || hasEnvironment" class="p-3 bg-amber-50 rounded-md border border-amber-200">
        <div class="flex items-center gap-2 text-sm">
          <Settings class="h-4 w-4 text-amber-600" />
          <span class="font-medium text-amber-800">Configuration Available:</span>
        </div>
        <div class="mt-1 text-xs text-amber-700">
          <span v-if="hasSettings && hasEnvironment">Settings and environment variables can be configured</span>
          <span v-else-if="hasSettings">Plugin settings can be configured</span>
          <span v-else-if="hasEnvironment">Environment variables can be configured</span>
        </div>
      </div>

      <Separator />

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
                  v-for="version in (plugin.versions || [{ version: plugin.version || 'v1.0.0', deprecated: plugin['version-deprecated'] || false }])"
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

      <div class="flex items-center justify-between">
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

        <div class="flex items-center gap-2">
          <Button
              v-if="!isInstalled"
              :disabled="isPluginDeprecated"
              variant="outline"
              size="sm"
              class="min-w-20"
              @click="handleSimpleInstall"
          >
            <Download class="h-4 w-4 mr-2" />
            Install
          </Button>

          <Button
              v-if="!isInstalled && needsConfiguration"
              :disabled="isPluginDeprecated"
              variant="default"
              size="sm"
              class="min-w-24"
              @click="handleInstallWithSettings"
          >
            <Settings class="h-4 w-4 mr-2" />
            Configure
          </Button>

          <Button
              v-if="isInstalled"
              variant="secondary"
              size="sm"
              class="min-w-24"
              disabled
          >
            <Check class="h-4 w-4 mr-2" />
            Installed
          </Button>
        </div>
      </div>
    </CardContent>

    <PluginSettingsDialog
        v-model:open="showSettingsDialog"
        :plugin-name="plugin.name"
        :versions="availableVersions"
        :selected-version="dialogSelectedVersion"
        :settings="plugin.settings"
        :environment="plugin.environment"
        :dependencies="plugin.dependencies"
        mode="add"
        @update:selected-version="handleDialogVersionChange"
        @add="handleSettingsDialogSubmit"
    />
  </Card>
</template>