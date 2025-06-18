<script setup lang="ts">
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Plus, Settings, X, Zap } from "lucide-vue-next";
import { computed, nextTick, ref, watch } from "vue";

// Type definitions
type PropertyType = "string" | "number" | "boolean" | "array" | "object";
type PropertyFormat = "date" | undefined;

interface Property {
  type: PropertyType;
  format?: PropertyFormat;
  description?: string;
  required?: boolean;
  default?: unknown;
  properties?: Record<string, Property>;
}

interface PluginSettings {
  type: string;
  properties: Record<string, Property>;
}

interface PluginDependency {
  name: string;
  url?: string;
}

type FormValue =
  | string
  | number
  | boolean
  | FormValue[]
  | Record<string, FormValue>;
type SettingsFormData = Record<string, FormValue>;
type EnvironmentFormData = Record<string, FormValue>;
type EnvironmentValue = string | number | boolean;

const props = defineProps<{
  open: boolean;
  pluginName: string | null;
  versions: string[];
  isLoading?: boolean;
  selectedVersion: string;
  mode: "add" | "configure";
  settings?: PluginSettings | null;
  environment?: Record<string, EnvironmentValue>;
  dependencies?: PluginDependency[];
}>();

const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
  (e: "update:selectedVersion", value: string): void;
  (
    e: "save" | "add",
    settingsData?: SettingsFormData,
    environmentData?: EnvironmentFormData,
  ): void;
}>();

const localSelectedVersion = ref(props.selectedVersion);
const settingsFormData = ref<SettingsFormData>({});
const environmentFormData = ref<EnvironmentFormData>({});
const activeTab = ref<string>("settings");

const hasSettings = computed(() => {
  return (
    props.settings &&
    props.settings.properties &&
    Object.keys(props.settings.properties).length > 0
  );
});

const hasEnvironment = computed(() => {
  return !!(props.environment && Object.keys(props.environment).length > 0);
});

const hasDependencies = computed(() => {
  return props.dependencies && props.dependencies.length > 0;
});

const initializeSettingsForm = () => {
  if (!hasSettings.value) return;

  const formData: SettingsFormData = {};
  const properties = props.settings!.properties;

  Object.entries(properties).forEach(([key, property]: [string, Property]) => {
    const defaultValue = property.default;

    if (property.type === "string") {
      formData[key] = defaultValue !== undefined ? String(defaultValue) : "";
    } else if (property.type === "number") {
      formData[key] = defaultValue !== undefined ? Number(defaultValue) : 0;
    } else if (property.type === "boolean") {
      if (defaultValue === true || defaultValue === false) {
        formData[key] = defaultValue;
      } else if (defaultValue === "true") {
        formData[key] = true;
      } else if (defaultValue === "false") {
        formData[key] = false;
      } else {
        formData[key] = false;
      }
    } else if (property.type === "array") {
      formData[key] = Array.isArray(defaultValue) ? [...defaultValue] : [];
    } else if (property.type === "object") {
      formData[key] =
        defaultValue && typeof defaultValue === "object"
          ? { ...(defaultValue as Record<string, FormValue>) }
          : {};
      if (property.properties) {
        Object.entries(property.properties).forEach(
          ([subKey, subProperty]: [string, Property]) => {
            const objectValue = formData[key] as Record<string, FormValue>;
            if (objectValue[subKey] === undefined) {
              if (subProperty.type === "string") {
                objectValue[subKey] = (subProperty.default as string) || "";
              } else if (subProperty.type === "number") {
                objectValue[subKey] =
                  subProperty.default !== undefined
                    ? Number(subProperty.default)
                    : 0;
              } else if (subProperty.type === "boolean") {
                if (
                  subProperty.default === true ||
                  subProperty.default === false
                ) {
                  objectValue[subKey] = subProperty.default;
                } else {
                  objectValue[subKey] = false;
                }
              } else {
                objectValue[subKey] = (subProperty.default as string) || "";
              }
            }
          },
        );
      }
    } else {
      formData[key] = defaultValue !== undefined ? String(defaultValue) : "";
    }
  });

  settingsFormData.value = formData;
};

const initializeEnvironmentForm = () => {
  if (!hasEnvironment.value) return;

  const formData: EnvironmentFormData = {};

  Object.entries(props.environment!).forEach(([key, value]) => {
    if (typeof value === "boolean") {
      formData[key] = value;
    } else if (typeof value === "number") {
      formData[key] = value;
    } else {
      formData[key] = String(value);
    }
  });

  environmentFormData.value = formData;
};

const getFieldType = (property: Property): string => {
  if (property.type === "boolean") {
    return "checkbox";
  } else if (property.type === "number") {
    return "number";
  } else if (property.format === "date") {
    return "date";
  } else if (property.type === "object") {
    return "object";
  } else if (property.type === "array") {
    return "array";
  }
  return "text";
};

const getEnvironmentFieldType = (value: EnvironmentValue): string => {
  if (typeof value === "boolean") {
    return "checkbox";
  } else if (typeof value === "number") {
    return "number";
  }
  return "text";
};

const formatLabel = (key: string): string => {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const addArrayItem = (key: string): void => {
  if (!settingsFormData.value[key]) {
    settingsFormData.value[key] = [];
  }
  (settingsFormData.value[key] as FormValue[]).push("");
};

const removeArrayItem = (key: string, index: number): void => {
  if (settingsFormData.value[key]) {
    (settingsFormData.value[key] as FormValue[]).splice(index, 1);
  }
};

const updateArrayItem = (key: string, index: number, value: string): void => {
  if (settingsFormData.value[key]) {
    (settingsFormData.value[key] as FormValue[])[index] = value;
  }
};

watch(
  () => props.open,
  (newVal) => {
    if (newVal) {
      if (props.selectedVersion) {
        localSelectedVersion.value = props.selectedVersion;
      }

      if (hasSettings.value) {
        activeTab.value = "settings";
      } else if (hasEnvironment.value) {
        activeTab.value = "environment";
      } else {
        activeTab.value = "general";
      }

      nextTick(() => {
        initializeSettingsForm();
        initializeEnvironmentForm();
      });
    }
  },
  { immediate: true },
);

watch(
  () => props.settings,
  (newSettings) => {
    if (props.open && newSettings) {
      nextTick(() => {
        initializeSettingsForm();
      });
    }
  },
  { deep: true, immediate: true },
);

watch(
  () => props.environment,
  (newEnvironment) => {
    if (props.open && newEnvironment) {
      nextTick(() => {
        initializeEnvironmentForm();
      });
    }
  },
  { deep: true, immediate: true },
);

watch(
  () => props.pluginName,
  (newName) => {
    if (props.open && newName) {
      nextTick(() => {
        if (hasSettings.value) initializeSettingsForm();
        if (hasEnvironment.value) initializeEnvironmentForm();
      });
    }
  },
);

watch(
  () => props.selectedVersion,
  (newVal) => {
    localSelectedVersion.value = newVal;
  },
);

watch(localSelectedVersion, (newVal) => {
  emit("update:selectedVersion", newVal);
});

const closeDialog = (): void => {
  emit("update:open", false);
};

const handleSubmit = (): void => {
  let settingsData: SettingsFormData | undefined = undefined;
  let environmentData: EnvironmentFormData | undefined = undefined;

  if (hasSettings.value && settingsFormData.value) {
    const filteredSettings: SettingsFormData = {};

    Object.entries(settingsFormData.value).forEach(([key, value]) => {
      if (typeof value === "boolean") {
        filteredSettings[key] = value;
      } else if (value !== "" && value !== null && value !== undefined) {
        if (Array.isArray(value) && value.length > 0) {
          filteredSettings[key] = value;
        } else if (
          typeof value === "object" &&
          value !== null &&
          Object.keys(value as Record<string, FormValue>).length > 0
        ) {
          filteredSettings[key] = value;
        } else if (typeof value !== "object") {
          filteredSettings[key] = value;
        }
      }
    });

    if (Object.keys(filteredSettings).length > 0) {
      settingsData = filteredSettings;
    }
  }

  if (hasEnvironment.value && environmentFormData.value) {
    const filteredEnvironment: EnvironmentFormData = {};

    Object.entries(environmentFormData.value).forEach(([key, value]) => {
      filteredEnvironment[key] = value;
    });

    if (Object.keys(filteredEnvironment).length > 0) {
      environmentData = filteredEnvironment;
    }
  }

  if (props.mode === "add") {
    emit("add", settingsData, environmentData);
  } else {
    emit("save", settingsData, environmentData);
  }
  closeDialog();
};
</script>

<template>
  <Dialog :open="open" @update:open="(val) => emit('update:open', val)">
    <DialogContent
      class="sm:max-w-[600px] max-h-[80vh] overflow-y-auto plugin-dialog-content"
    >
      <DialogHeader>
        <DialogTitle class="plugin-dialog-text">
          {{ mode === "add" ? "Configure" : "Plugin Settings for" }}
          {{ pluginName }}
        </DialogTitle>
        <DialogDescription v-if="pluginName" class="plugin-dialog-text">
          <span v-if="mode === 'add'"
            >Configure the plugin settings before installation.</span
          >
          <span v-else
            >Configure plugin settings and environment variables</span
          >
          <span v-if="hasDependencies" class="block mt-1 text-blue-600">
            <Download class="inline h-3 w-3 mr-1" />
            Dependencies ({{ dependencies!.map((dep) => dep.name).join(", ") }})
            will be installed automatically.
          </span>
        </DialogDescription>
      </DialogHeader>

      <form
        v-if="pluginName"
        class="space-y-4 py-4 plugin-dialog-content"
        @submit.prevent="handleSubmit"
      >
        <div
          v-if="hasDependencies"
          class="p-3 bg-blue-50 rounded-md border border-blue-200"
        >
          <div class="flex items-center gap-2 text-sm plugin-dialog-text">
            <Download class="h-4 w-4 text-blue-600" />
            <span class="font-medium text-blue-800"
              >Dependencies will be installed:</span
            >
          </div>
          <div class="mt-1 flex flex-wrap gap-1">
            <Badge
              v-for="dep in dependencies"
              :key="dep.name"
              variant="outline"
              class="text-xs plugin-dialog-text"
            >
              {{ dep.name }}
            </Badge>
          </div>
        </div>

        <Tabs v-model="activeTab" class="w-full">
          <TabsList
            class="grid w-full plugin-dialog-content"
            :class="{
              'grid-cols-3': hasSettings && hasEnvironment,
              'grid-cols-2':
                (hasSettings && !hasEnvironment) ||
                (!hasSettings && hasEnvironment),
              'grid-cols-1': !hasSettings && !hasEnvironment,
            }"
          >
            <TabsTrigger value="general" class="plugin-dialog-text">
              <Settings class="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger
              v-if="hasSettings"
              value="settings"
              class="plugin-dialog-text"
            >
              <Settings class="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger
              v-if="hasEnvironment"
              value="environment"
              class="plugin-dialog-text"
            >
              <Zap class="h-4 w-4 mr-2" />
              Environment
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" class="space-y-4">
            <div class="grid grid-cols-4 items-center gap-4">
              <Label for="version" class="text-right plugin-dialog-text"
                >Version</Label
              >
              <div class="col-span-3">
                <Select v-model="localSelectedVersion">
                  <SelectTrigger
                    :disabled="isLoading"
                    class="plugin-dialog-text"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent class="plugin-dialog-content">
                    <SelectItem
                      v-for="version in versions"
                      :key="version"
                      :value="version"
                      class="plugin-dialog-text"
                    >
                      {{ version }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p
                  v-if="isLoading"
                  class="text-xs text-muted-foreground mt-1 plugin-dialog-text"
                >
                  Loading available versions...
                </p>
                <p
                  v-else-if="versions.length === 0"
                  class="text-xs text-muted-foreground mt-1 plugin-dialog-text"
                >
                  No additional versions available
                </p>
              </div>
            </div>

            <div
              v-if="!hasSettings && !hasEnvironment && mode === 'add'"
              class="text-sm text-muted-foreground p-4 bg-gray-50 rounded-md plugin-dialog-text"
            >
              No configuration options available for this plugin. It will be
              installed with default settings.
            </div>
          </TabsContent>

          <TabsContent v-if="hasSettings" value="settings" class="space-y-4">
            <div class="space-y-4">
              <h4 class="text-sm font-medium plugin-dialog-text">
                Plugin Settings
              </h4>

              <div
                v-for="[key, property] in Object.entries(settings!.properties)"
                :key="key"
                class="space-y-2"
              >
                <Label
                  :for="key"
                  class="text-sm font-medium plugin-dialog-text"
                >
                  {{ formatLabel(key) }}
                  <span v-if="property.required" class="text-red-500">*</span>
                </Label>

                <Input
                  v-if="getFieldType(property) === 'text'"
                  :id="key"
                  v-model="settingsFormData[key] as string"
                  :placeholder="
                    property.description || `Enter ${formatLabel(key)}`
                  "
                  :required="property.required"
                  class="col-span-3 plugin-dialog-input"
                />

                <Input
                  v-else-if="getFieldType(property) === 'number'"
                  :id="key"
                  v-model.number="settingsFormData[key] as number"
                  type="number"
                  :placeholder="
                    property.description || `Enter ${formatLabel(key)}`
                  "
                  :required="property.required"
                  class="col-span-3 plugin-dialog-input"
                />

                <Input
                  v-else-if="getFieldType(property) === 'date'"
                  :id="key"
                  v-model="settingsFormData[key] as string"
                  type="date"
                  :required="property.required"
                  class="col-span-3 plugin-dialog-input"
                />

                <div
                  v-else-if="getFieldType(property) === 'checkbox'"
                  class="flex items-center space-x-2"
                >
                  <input
                    :id="key"
                    v-model="settingsFormData[key] as boolean"
                    type="checkbox"
                    class="rounded border-gray-300"
                  >
                  <Label :for="key" class="text-sm plugin-dialog-text">{{
                    property.description || formatLabel(key)
                  }}</Label>
                </div>

                <div
                  v-else-if="getFieldType(property) === 'array'"
                  class="space-y-2"
                >
                  <div
                    v-for="(item, index) in (settingsFormData[
                      key
                    ] as FormValue[]) || []"
                    :key="index"
                    class="flex items-center gap-2"
                  >
                    <Input
                      :model-value="item as string"
                      :placeholder="`${formatLabel(key)} #${index + 1}`"
                      class="flex-1 plugin-dialog-input"
                      @update:model-value="
                        (value) => updateArrayItem(key, index, value)
                      "
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      class="p-1 h-8 w-8"
                      @click="removeArrayItem(key, index)"
                    >
                      <X class="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    class="w-full plugin-dialog-text"
                    @click="addArrayItem(key)"
                  >
                    <Plus class="h-4 w-4 mr-2" />
                    Add {{ formatLabel(key.replace(/s$/, "")) }}
                  </Button>
                </div>

                <div
                  v-else-if="getFieldType(property) === 'object'"
                  class="space-y-3 pl-4 border-l-2 border-gray-200"
                >
                  <div
                    v-for="[subKey, subProperty] in Object.entries(
                      property.properties || {},
                    )"
                    :key="`${key}.${subKey}`"
                    class="grid grid-cols-4 items-center gap-4"
                  >
                    <Label
                      :for="`${key}.${subKey}`"
                      class="text-xs text-muted-foreground text-right plugin-dialog-text"
                    >
                      {{ formatLabel(subKey) }}
                    </Label>
                    <Input
                      :id="`${key}.${subKey}`"
                      :model-value="
                        ((settingsFormData[key] as Record<string, FormValue>)?.[
                          subKey
                        ] as string) || ''
                      "
                      :placeholder="
                        subProperty.description ||
                        `Enter ${formatLabel(subKey)}`
                      "
                      class="col-span-3 text-sm plugin-dialog-input"
                      @update:model-value="
                        (value) => {
                          if (!settingsFormData[key])
                            settingsFormData[key] = {};
                          (settingsFormData[key] as Record<string, FormValue>)[
                            subKey
                          ] = value;
                        }
                      "
                    />
                  </div>
                </div>

                <p
                  v-if="property.description"
                  class="text-xs text-muted-foreground plugin-dialog-text"
                >
                  {{ property.description }}
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent
            v-if="hasEnvironment"
            value="environment"
            class="space-y-4"
          >
            <div class="space-y-4">
              <div class="flex items-center gap-2">
                <Zap class="h-4 w-4 text-yellow-600" />
                <h4 class="text-sm font-medium plugin-dialog-text">
                  Environment Variables
                </h4>
              </div>
              <p class="text-xs text-muted-foreground plugin-dialog-text">
                Configure environment variables for this plugin. Variables
                prefixed with "env." will be resolved from system environment.
              </p>

              <div
                v-for="[key, value] in Object.entries(environment!)"
                :key="key"
                class="space-y-2"
              >
                <Label
                  :for="`env-${key}`"
                  class="text-sm font-medium plugin-dialog-text"
                >
                  {{ formatLabel(key) }}
                </Label>

                <Input
                  v-if="getEnvironmentFieldType(value) === 'text'"
                  :id="`env-${key}`"
                  v-model="environmentFormData[key] as string"
                  :placeholder="`Enter ${formatLabel(key)}`"
                  class="text-sm plugin-dialog-input"
                />

                <Input
                  v-else-if="getEnvironmentFieldType(value) === 'number'"
                  :id="`env-${key}`"
                  v-model.number="environmentFormData[key] as number"
                  type="number"
                  :placeholder="`Enter ${formatLabel(key)}`"
                  class="text-sm plugin-dialog-input"
                />

                <div
                  v-else-if="getEnvironmentFieldType(value) === 'checkbox'"
                  class="flex items-center space-x-2"
                >
                  <input
                    :id="`env-${key}`"
                    v-model="environmentFormData[key] as boolean"
                    type="checkbox"
                    class="rounded border-gray-300"
                  >
                  <Label
                    :for="`env-${key}`"
                    class="text-sm plugin-dialog-text"
                    >{{ formatLabel(key) }}</Label
                  >
                </div>


              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            class="plugin-dialog-text"
            @click="closeDialog"
            >Cancel</Button
          >
          <Button
            type="submit"
            class="plugin-dialog-text"
            :disabled="isLoading"
          >
            {{ mode === "add" ? "Install Plugin" : "Save changes" }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
.plugin-dialog-content,
.plugin-dialog-content *,
.plugin-dialog-text,
.plugin-dialog-input,
.plugin-dialog-input * {
  letter-spacing: normal !important;
  font-family: inherit !important;
}

.plugin-dialog-content {
  letter-spacing: normal !important;
}

.plugin-dialog-text {
  letter-spacing: normal !important;
}

.plugin-dialog-input {
  letter-spacing: normal !important;
  font-family: inherit !important;
}

/* Ensure all text elements have normal letter spacing */
.plugin-dialog-content label,
.plugin-dialog-content input,
.plugin-dialog-content button,
.plugin-dialog-content p,
.plugin-dialog-content span,
.plugin-dialog-content div,
.plugin-dialog-content h1,
.plugin-dialog-content h2,
.plugin-dialog-content h3,
.plugin-dialog-content h4,
.plugin-dialog-content h5,
.plugin-dialog-content h6 {
  letter-spacing: normal !important;
}
</style>
