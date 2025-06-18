<script setup lang="ts">
<<<<<<< configuration-with-registry
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
=======
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { RegistryPlugin } from "~/assets/types/typelist";
import PluginSettingsDialog from "~/components/molecules/PluginSettingsDialog.vue";
import {
  AlertTriangle,
  Book,
  Check,
  Clock,
  Download,
  Github,
  Home,
  Scale,
  Settings,
  User,
} from "lucide-vue-next";
import { computed, ref } from "vue";

// Define specific types for better type safety
interface PluginDependency {
  name: string;
  version?: string;
>>>>>>> master
  [key: string]: unknown;
}

interface Props {
  plugin: RegistryPlugin;
  selectedVersion?: string;
  isInstalled: boolean;
}

interface Emits {
<<<<<<< configuration-with-registry
  (e: "add-plugin", pluginName: string, withSettings?: boolean, settings?: Record<string, unknown>, environment?: Record<string, string>, dependencies?: PluginDependency[], version?: string): void;
=======
  (
    e: "add-plugin",
    pluginName: string,
    withSettings?: boolean,
    settings?: Record<string, unknown>,
    environment?: Record<string, unknown>,
    dependencies?: PluginDependency[],
    version?: string,
  ): void;
>>>>>>> master
  (e: "update-version", pluginName: string, version: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const showSettingsDialog = ref(false);
<<<<<<< configuration-with-registry
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
=======
const dialogSelectedVersion = ref("");

const latestVersion = computed(() => {
  const nonDeprecatedVersions =
    props.plugin.versions?.filter((v) => !v.deprecated) || [];
  return nonDeprecatedVersions.length > 0
    ? nonDeprecatedVersions[nonDeprecatedVersions.length - 1]
    : props.plugin.versions?.[props.plugin.versions.length - 1] || {
        version: props.plugin.version || "v1.0.0",
        "compatible-bot-version": props.plugin["compatible-bot-version"] || "3",
        deprecated: props.plugin["version-deprecated"] || false,
        "deprecated-reason": "",
      };
});

const currentVersion = computed(() => {
  if (props.selectedVersion && props.plugin.versions) {
    return props.plugin.versions.find(
      (v) => v.version === props.selectedVersion,
    );
  }
  if (!props.plugin.versions) {
    return {
      version: props.plugin.version || "v1.0.0",
      "compatible-bot-version": props.plugin["compatible-bot-version"] || "3",
      deprecated: props.plugin["version-deprecated"] || false,
      "deprecated-reason": "",
    };
  }
  return latestVersion.value;
});

const availableVersions = computed(() => {
  if (props.plugin.versions) {
    return props.plugin.versions.map((v) => v.version);
  }
  return [props.plugin.version || "v1.0.0"];
});

const hasSettings = computed(() => {
  return (
    props.plugin.settings &&
    props.plugin.settings.properties &&
    Object.keys(props.plugin.settings.properties).length > 0
  );
});

const hasEnvironment = computed(() => {
  return (
    props.plugin.environment &&
    props.plugin.environment.properties &&
    Object.keys(props.plugin.environment.properties).length > 0
  );
>>>>>>> master
});

const hasDependencies = computed(() => {
  return props.plugin.dependencies && props.plugin.dependencies.length > 0;
});

const needsConfiguration = computed(() => {
  return hasSettings.value || hasEnvironment.value || hasDependencies.value;
});

const isPluginDeprecated = computed(() => {
<<<<<<< configuration-with-registry
  return props.plugin.deprecated || props.plugin['plugin-deprecated'] || false;
});

const deprecationReason = computed(() => {
  return props.plugin.deprecatedReason ||
      props.plugin['plugin-deprecation-reason'] ||
      props.plugin['deprecation-reason'] ||
      'This plugin is no longer maintained.';
=======
  return props.plugin.deprecated || props.plugin["plugin-deprecated"] || false;
});

const deprecationReason = computed(() => {
  return (
    props.plugin.deprecatedReason ||
    props.plugin["deprecation-reason"] ||
    "This plugin is no longer maintained."
  );
>>>>>>> master
});

const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return dateString;
  }
};

<<<<<<< configuration-with-registry
=======
const handleVersionChange = (version: string): void => {
  emit("update-version", props.plugin.name, version);
};

>>>>>>> master
const handleDialogVersionChange = (version: string): void => {
  dialogSelectedVersion.value = version;
};

const handleSimpleInstall = (): void => {
<<<<<<< configuration-with-registry
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
=======
  emit(
    "add-plugin",
    props.plugin.name,
    false,
    undefined,
    undefined,
    props.plugin.dependencies,
    currentVersion.value?.version,
  );
};

const handleInstallWithSettings = (): void => {
  dialogSelectedVersion.value =
    currentVersion.value?.version || latestVersion.value.version;
  showSettingsDialog.value = true;
};

const handleSettingsDialogSubmit = (
  settingsData?: Record<string, unknown>,
  environmentData?: Record<string, unknown>,
): void => {
  const hasData =
    (settingsData && Object.keys(settingsData).length > 0) ||
    (environmentData && Object.keys(environmentData).length > 0);

  emit(
    "add-plugin",
    props.plugin.name,
    hasData,
    settingsData,
    environmentData,
    props.plugin.dependencies,
    dialogSelectedVersion.value,
  );
>>>>>>> master

  if (dialogSelectedVersion.value !== currentVersion.value?.version) {
    emit("update-version", props.plugin.name, dialogSelectedVersion.value);
  }

  showSettingsDialog.value = false;
};

<<<<<<< configuration-with-registry
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
=======
const getVersionBadgeVariant = (version: {
  deprecated?: boolean;
  [key: string]: unknown;
}) => {
  if (version.deprecated) return "destructive";
  return "secondary";
};

const openExternalUrl = (url: string): void => {
  if (import.meta.client && url) {
    window.open(url, "_blank");
  }
};
</script>

<template>
  <Card
    class="relative transition-all hover:shadow-md"
    :class="{ 'border-orange-200 bg-orange-50/50': isPluginDeprecated }"
  >
>>>>>>> master
    <CardHeader class="pb-3">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <CardTitle class="text-lg flex items-center gap-2">
            {{ plugin.name }}
<<<<<<< configuration-with-registry
            <Badge v-if="isPluginDeprecated" variant="destructive" class="text-xs">
=======
            <Badge
              v-if="isPluginDeprecated"
              variant="destructive"
              class="text-xs"
            >
>>>>>>> master
              <AlertTriangle class="h-3 w-3 mr-1" />
              Deprecated
            </Badge>
            <Badge v-if="isInstalled" variant="default" class="text-xs">
              <Check class="h-3 w-3 mr-1" />
              Installed
            </Badge>
          </CardTitle>

<<<<<<< configuration-with-registry
          <p v-if="plugin.description" class="text-sm text-muted-foreground mt-1">
=======
          <p class="text-sm text-muted-foreground mt-1">
>>>>>>> master
            {{ plugin.description }}
          </p>

          <div v-if="isPluginDeprecated" class="mt-2">
<<<<<<< configuration-with-registry
            <Badge variant="outline" class="text-xs text-orange-600 border-orange-200 dark:text-orange-400 dark:border-orange-800">
=======
            <Badge
              variant="outline"
              class="text-xs text-orange-600 border-orange-200"
            >
>>>>>>> master
              {{ deprecationReason }}
            </Badge>
          </div>
        </div>
      </div>

<<<<<<< configuration-with-registry
      <div v-if="plugin.tags && plugin.tags.length > 0" class="flex flex-wrap gap-1 mt-2">
        <Badge v-for="tag in plugin.tags" :key="tag" variant="outline" class="text-xs">
=======
      <div
        v-if="plugin.tags && plugin.tags.length > 0"
        class="flex flex-wrap gap-1 mt-2"
      >
        <Badge
          v-for="tag in plugin.tags"
          :key="tag"
          variant="outline"
          class="text-xs"
        >
>>>>>>> master
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
<<<<<<< configuration-with-registry
        <div v-if="plugin.authors && plugin.authors.length > 0" class="flex items-center gap-2">
          <User class="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span class="text-muted-foreground truncate">
            {{ plugin.authors.length === 1 ? getAuthorName(plugin.authors[0]) : `${plugin.authors.length} authors` }}
=======
        <div
          v-if="plugin.authors && plugin.authors.length > 0"
          class="flex items-center gap-2"
        >
          <User class="h-4 w-4 text-muted-foreground" />
          <span class="text-muted-foreground">
            {{
              plugin.authors.length === 1
                ? plugin.authors[0].split("<")[0].trim()
                : `${plugin.authors.length} authors`
            }}
>>>>>>> master
          </span>
        </div>

        <div v-if="plugin.license" class="flex items-center gap-2">
<<<<<<< configuration-with-registry
          <Scale class="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span class="text-muted-foreground">{{ plugin.license }}</span>
        </div>

        <div v-if="plugin['release-time']" class="flex items-center gap-2">
          <Clock class="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span class="text-muted-foreground">{{ formatDate(plugin['release-time']) }}</span>
=======
          <Scale class="h-4 w-4 text-muted-foreground" />
          <span class="text-muted-foreground">{{ plugin.license }}</span>
        </div>

        <div
          v-if="plugin.updateTime || plugin['update-time']"
          class="flex items-center gap-2"
        >
          <Clock class="h-4 w-4 text-muted-foreground" />
          <span class="text-muted-foreground">{{
            formatDate(plugin.updateTime || plugin["update-time"])
          }}</span>
>>>>>>> master
        </div>

        <div class="flex items-center gap-2">
          <Badge variant="outline" class="text-xs">
<<<<<<< configuration-with-registry
            v{{ currentVersion['compatible-bot-version'] }}+
=======
            {{ plugin.versions?.length || 1 }} version{{
              (plugin.versions?.length || 1) !== 1 ? "s" : ""
            }}
>>>>>>> master
          </Badge>
        </div>
      </div>

<<<<<<< configuration-with-registry
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
=======
      <div
        v-if="hasDependencies"
        class="p-3 bg-blue-50 dark:bg-blue-950/50 rounded-md border border-blue-200 dark:border-blue-800"
      >
        <div class="flex items-center gap-2 text-sm">
          <Download class="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span class="font-medium text-blue-800 dark:text-blue-200"
            >Dependencies:</span
          >
        </div>
        <div class="mt-1 text-xs text-blue-700 dark:text-blue-300">
          {{ plugin.dependencies?.map((dep) => dep.name).join(", ") }} will be
          installed automatically
        </div>
      </div>
      <div
        v-if="hasSettings || hasEnvironment"
        class="p-3 bg-amber-50 rounded-md border border-amber-200"
      >
        <div class="flex items-center gap-2 text-sm">
          <Settings class="h-4 w-4 text-amber-600" />
          <span class="font-medium text-amber-800"
            >Configuration Available:</span
          >
        </div>
        <div class="mt-1 text-xs text-amber-700">
          <span v-if="hasSettings && hasEnvironment"
            >Settings and environment variables can be configured</span
          >
          <span v-else-if="hasSettings">Plugin settings can be configured</span>
          <span v-else-if="hasEnvironment"
            >Environment variables can be configured</span
          >
>>>>>>> master
        </div>
      </div>

      <Separator />

      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <label class="text-sm font-medium">Version:</label>
<<<<<<< configuration-with-registry
          <Badge variant="secondary" class="text-xs">
            {{ currentVersion.version }}
          </Badge>
        </div>

        <div v-if="currentVersion.deprecated" class="text-xs">
          <Badge variant="destructive" class="text-xs">
            {{ currentVersion['deprecated-reason'] || 'Deprecated version' }}
          </Badge>
=======
          <Select
            :model-value="currentVersion?.version || ''"
            @update:model-value="handleVersionChange"
          >
            <SelectTrigger class="w-32">
              <SelectValue placeholder="Select version" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="version in plugin.versions || [
                  {
                    version: plugin.version || 'v1.0.0',
                    deprecated: plugin['version-deprecated'] || false,
                  },
                ]"
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
            <span>Bot v{{ currentVersion["compatible-bot-version"] }}+</span>
            <Badge
              v-if="currentVersion.deprecated"
              variant="destructive"
              class="text-xs"
            >
              {{ currentVersion["deprecated-reason"] || "Deprecated" }}
            </Badge>
          </div>
>>>>>>> master
        </div>
      </div>

      <Separator />

      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Button
<<<<<<< configuration-with-registry
              v-if="plugin.homepage"
              variant="ghost"
              size="sm"
              class="p-2"
              title="Homepage"
              @click="openExternalUrl(plugin.homepage)"
=======
            v-if="plugin.homepage"
            variant="ghost"
            size="sm"
            class="p-2"
            title="Homepage"
            @click="openExternalUrl(plugin.homepage)"
>>>>>>> master
          >
            <Home class="h-4 w-4" />
          </Button>

          <Button
<<<<<<< configuration-with-registry
              v-if="plugin.documentation"
              variant="ghost"
              size="sm"
              class="p-2"
              title="Documentation"
              @click="openExternalUrl(plugin.documentation)"
=======
            v-if="plugin.documentation"
            variant="ghost"
            size="sm"
            class="p-2"
            title="Documentation"
            @click="openExternalUrl(plugin.documentation)"
>>>>>>> master
          >
            <Book class="h-4 w-4" />
          </Button>

          <Button
<<<<<<< configuration-with-registry
              v-if="plugin.repository"
              variant="ghost"
              size="sm"
              class="p-2"
              title="Repository"
              @click="openExternalUrl(plugin.repository)"
=======
            v-if="plugin.repository"
            variant="ghost"
            size="sm"
            class="p-2"
            title="Repository"
            @click="openExternalUrl(plugin.repository)"
>>>>>>> master
          >
            <Github class="h-4 w-4" />
          </Button>
        </div>

        <div class="flex items-center gap-2">
          <Button
<<<<<<< configuration-with-registry
              v-if="!isInstalled"
              :disabled="isPluginDeprecated"
              variant="outline"
              size="sm"
              class="min-w-20"
              @click="handleSimpleInstall"
=======
            v-if="!isInstalled"
            :disabled="isPluginDeprecated"
            variant="outline"
            size="sm"
            class="min-w-20"
            @click="handleSimpleInstall"
>>>>>>> master
          >
            <Download class="h-4 w-4 mr-2" />
            Install
          </Button>

          <Button
<<<<<<< configuration-with-registry
              v-if="!isInstalled && needsConfiguration"
              :disabled="isPluginDeprecated"
              variant="default"
              size="sm"
              class="min-w-24"
              @click="handleInstallWithSettings"
=======
            v-if="!isInstalled && needsConfiguration"
            :disabled="isPluginDeprecated"
            variant="default"
            size="sm"
            class="min-w-24"
            @click="handleInstallWithSettings"
>>>>>>> master
          >
            <Settings class="h-4 w-4 mr-2" />
            Configure
          </Button>

          <Button
<<<<<<< configuration-with-registry
              v-if="isInstalled"
              variant="secondary"
              size="sm"
              class="min-w-24"
              disabled
=======
            v-if="isInstalled"
            variant="secondary"
            size="sm"
            class="min-w-24"
            disabled
>>>>>>> master
          >
            <Check class="h-4 w-4 mr-2" />
            Installed
          </Button>
        </div>
      </div>
    </CardContent>

    <PluginSettingsDialog
<<<<<<< configuration-with-registry
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
=======
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
>>>>>>> master
    />
  </Card>
</template>
