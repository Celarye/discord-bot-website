<script setup lang="ts">
import { computed, ref } from "vue";
import type { RegistryPlugin } from "~/assets/types/typelist";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

interface PluginDependency {
  name: string;
  version?: string;
  registry?: string;
  [key: string]: unknown;
}

interface Props {
  plugin: RegistryPlugin;
  selectedVersion?: string;
  isInstalled: boolean;
}

interface Emits {
  (e: "add-plugin", pluginName: string, withSettings?: boolean, settings?: Record<string, unknown>, environment?: Record<string, string>, dependencies?: PluginDependency[], version?: string): void;
  (e: "update-version", pluginName: string, version: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const showSettingsDialog = ref(false);
const dialogSelectedVersion = ref('');

const currentVersion = computed(() => {
  return {
    version: props.plugin.version || 'v1.0.0',
    'compatible-bot-version': String(props.plugin['compatible-bot-version'] || '1.0'),
    deprecated: props.plugin['version-deprecated'] || false,
    'deprecated-reason': props.plugin['version-deprecation-reason'] || ''
  };
});

const availableVersions = computed(() => {
  return [currentVersion.value.version];
});

const hasSettings = computed(() => {
  if (!props.plugin.settings) return false;

  if (typeof props.plugin.settings === 'object') {
    if (props.plugin.settings.properties) {
      return Object.keys(props.plugin.settings.properties).length > 0;
    }
    return Object.keys(props.plugin.settings).length > 0;
  }

  return false;
});

const hasEnvironment = computed(() => {
  return props.plugin.environment &&
      typeof props.plugin.environment === 'object' &&
      Object.keys(props.plugin.environment).length > 0;
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
  return props.plugin.deprecatedReason ||
      props.plugin['plugin-deprecation-reason'] ||
      props.plugin['deprecation-reason'] ||
      'This plugin is no longer maintained.';
});

const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return dateString;
  }
};

const handleDialogVersionChange = (version: string): void => {
  dialogSelectedVersion.value = version;
};

const handleSimpleInstall = (): void => {
  const processedEnvironment = props.plugin.environment ?
      Object.fromEntries(
          Object.entries(props.plugin.environment).map(([key, value]) => [
            key,
            typeof value === 'string' ? value : String(value)
          ])
      ) : undefined;

  emit("add-plugin", props.plugin.name, false, undefined, processedEnvironment, props.plugin.dependencies, currentVersion.value?.version);
};

const handleInstallWithSettings = (): void => {
  dialogSelectedVersion.value = currentVersion.value?.version;
  showSettingsDialog.value = true;
};

const handleSettingsDialogSubmit = (settingsData?: Record<string, unknown>, environmentData?: Record<string, string>): void => {
  const hasData = (settingsData && Object.keys(settingsData).length > 0) ||
      (environmentData && Object.keys(environmentData).length > 0);

  const processedEnvironment = environmentData ?
      Object.fromEntries(
          Object.entries(environmentData).map(([key, value]) => [key, String(value)])
      ) : undefined;

  emit("add-plugin", props.plugin.name, hasData, settingsData, processedEnvironment, props.plugin.dependencies, dialogSelectedVersion.value);

  if (dialogSelectedVersion.value !== currentVersion.value?.version) {
    emit("update-version", props.plugin.name, dialogSelectedVersion.value);
  }

  showSettingsDialog.value = false;
};

const openExternalUrl = (url: string): void => {
  if (import.meta.client && url) {
    window.open(url, '_blank');
  }
};

const getAuthorName = (author: string): string => {
  return author.split('<')[0].trim();
};

const environmentInfo = computed(() => {
  if (!hasEnvironment.value) return null;

  const env = props.plugin.environment as Record<string, boolean | string>;
  const required = Object.entries(env).filter(([_, value]) => value === true);
  const optional = Object.entries(env).filter(([_, value]) => value !== true);

  return {
    required: required.map(([key]) => key),
    optional: optional.map(([key]) => key),
    total: Object.keys(env).length
  };
});

const dialogSettings = computed(() => {
  if (!hasSettings.value) return undefined;
  return props.plugin.settings;
});

const dialogEnvironment = computed(() => {
  if (!hasEnvironment.value) return undefined;

  const env = props.plugin.environment as Record<string, boolean | string>;
  const environmentWithValues: Record<string, string> = {};

  Object.entries(env).forEach(([key, value]) => {
    if (value === true) {
      environmentWithValues[key] = "";
    } else if (typeof value === 'string') {
      environmentWithValues[key] = value;
    } else {
      environmentWithValues[key] = "";
    }
  });

  return Object.keys(environmentWithValues).length > 0 ? environmentWithValues : undefined;
});
</script>

<template>
  <Card class="relative transition-all hover:shadow-md" :class="{ 'border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20': isPluginDeprecated }">
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

          <p v-if="plugin.description" class="text-sm text-muted-foreground mt-1">
            {{ plugin.description }}
          </p>

          <div v-if="isPluginDeprecated" class="mt-2">
            <Badge variant="outline" class="text-xs text-orange-600 border-orange-200 dark:text-orange-400 dark:border-orange-800">
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
          <User class="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span class="text-muted-foreground truncate">
            {{ plugin.authors.length === 1 ? getAuthorName(plugin.authors[0]) : `${plugin.authors.length} authors` }}
          </span>
        </div>

        <div v-if="plugin.license" class="flex items-center gap-2">
          <Scale class="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span class="text-muted-foreground">{{ plugin.license }}</span>
        </div>

        <div v-if="plugin['release-time']" class="flex items-center gap-2">
          <Clock class="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span class="text-muted-foreground">{{ formatDate(plugin['release-time']) }}</span>
        </div>

        <div class="flex items-center gap-2">
          <Badge variant="outline" class="text-xs">
            v{{ currentVersion['compatible-bot-version'] }}+
          </Badge>
        </div>
      </div>

      <div v-if="hasDependencies" class="p-3 bg-blue-50 dark:bg-blue-950/50 rounded-md border border-blue-200 dark:border-blue-800">
        <div class="flex items-center gap-2 text-sm">
          <Download class="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span class="font-medium text-blue-800 dark:text-blue-200">Dependencies:</span>
        </div>
        <div class="mt-1 text-xs text-blue-700 dark:text-blue-300">
          {{ plugin.dependencies?.map(dep => dep.name).join(', ') }} will be installed automatically
        </div>
      </div>

      <div v-if="hasSettings || hasEnvironment" class="p-3 bg-amber-50 dark:bg-amber-950/50 rounded-md border border-amber-200 dark:border-amber-800">
        <div class="flex items-center gap-2 text-sm">
          <Settings class="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <span class="font-medium text-amber-800 dark:text-amber-200">Configuration Available:</span>
        </div>
        <div class="mt-1 text-xs text-amber-700 dark:text-amber-300">
          <div v-if="hasSettings && hasEnvironment" class="space-y-1">
            <div>Plugin settings can be configured</div>
            <div v-if="environmentInfo">
              Environment variables:
              <span v-if="environmentInfo.required.length > 0" class="font-medium">
                {{ environmentInfo.required.length }} required
              </span>
              <span v-if="environmentInfo.required.length > 0 && environmentInfo.optional.length > 0">, </span>
              <span v-if="environmentInfo.optional.length > 0">
                {{ environmentInfo.optional.length }} optional
              </span>
            </div>
          </div>
          <div v-else-if="hasSettings">Plugin settings can be configured</div>
          <div v-else-if="hasEnvironment && environmentInfo">
            Environment variables:
            <span v-if="environmentInfo.required.length > 0" class="font-medium">
              {{ environmentInfo.required.length }} required
            </span>
            <span v-if="environmentInfo.required.length > 0 && environmentInfo.optional.length > 0">, </span>
            <span v-if="environmentInfo.optional.length > 0">
              {{ environmentInfo.optional.length }} optional
            </span>
          </div>
        </div>
      </div>

      <Separator />

      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <label class="text-sm font-medium">Version:</label>
          <Badge variant="secondary" class="text-xs">
            {{ currentVersion.version }}
          </Badge>
        </div>

        <div v-if="currentVersion.deprecated" class="text-xs">
          <Badge variant="destructive" class="text-xs">
            {{ currentVersion['deprecated-reason'] || 'Deprecated version' }}
          </Badge>
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
        v-if="showSettingsDialog"
        v-model:open="showSettingsDialog"
        :plugin-name="plugin.name"
        :versions="availableVersions"
        :selected-version="dialogSelectedVersion"
        :settings="dialogSettings"
        :environment="dialogEnvironment"
        :dependencies="plugin.dependencies"
        mode="add"
        @update:selected-version="handleDialogVersionChange"
        @add="handleSettingsDialogSubmit"
    />
  </Card>
</template>