export interface PluginVersion {
  version: string;
  "compatible-bot-version": number;
  deprecated?: boolean;
  "deprecated-reason"?: string;
}

export interface PluginMetadata {

  name: string;
  version: string;
  "compatible-bot-version": number;
  "version-deprecated": boolean;
  "version-deprecation-reason"?: string;
  "plugin-deprecated": boolean;
  "plugin-deprecation-reason"?: string;
  description: string;
  authors: string[];
  license: string;
  "update-time": string;
  homepage?: string;
  documentation?: string;
  repository?: string;
  tags?: string[];
}

export interface RegistryPluginData {
  versions: PluginVersion[];
  description: string;
  "update-time": string;
  deprecated?: boolean;
  "deprecated-reason"?: string;
}

interface PluginSettings {
  type: string;
  properties: Record<string, unknown>;
}

interface PluginDependency {
  name: string;
  url?: string;
  version?: string;
}

export interface RegistryPlugin {
  name: string;
  description: string;
  versions: PluginVersion[];
  deprecated?: boolean;
  deprecatedReason?: string;
  updateTime: string;
  // Metadata fields
  authors: string[];
  license: string;
  homepage?: string;
  documentation?: string;
  repository?: string;
  tags?: string[];
  settings?: PluginSettings;
  environment?: Record<string, unknown>;
  dependencies?: PluginDependency[];
}


export interface PluginRegistry {
  name: string;
  description: string;

export interface PluginVersion {
  version: string;
  "compatible-bot-version": number;
  deprecated?: boolean;
  "deprecated-reason"?: string;
}

export interface PluginMetadata {
  name: string;
  version: string;
  enabled?: boolean;

  "compatible-bot-version": number;
  "version-deprecated": boolean;
  "version-deprecation-reason"?: string;
  "plugin-deprecated": boolean;
  "plugin-deprecation-reason"?: string;
  description: string;
  authors: string[];
  license: string;
  "update-time": string;
  homepage?: string;
  documentation?: string;
  repository?: string;
  tags?: string[];
}

export interface RegistryPluginData {
  versions: PluginVersion[];
  description: string;
  "update-time": string;
  deprecated?: boolean;
  "deprecated-reason"?: string;
}

interface PluginSettings {
  type: string;
  properties: Record<string, unknown>;
}

interface PluginDependency {
  name: string;
  url?: string;
  version?: string;
}

export interface RegistryPlugin {
  name: string;
  description: string;
  versions: PluginVersion[];
  deprecated?: boolean;
  deprecatedReason?: string;
  updateTime: string;
  // Metadata fields
  authors: string[];
  license: string;
  homepage?: string;
  documentation?: string;
  repository?: string;
  tags?: string[];
  settings?: PluginSettings;
  environment?: Record<string, unknown>;
  dependencies?: PluginDependency[];
}

export interface PluginRegistry {
  name: string;
  description: string;

  maintainers: string[];
  "registry-manager": {
    "build-time": string;
    "built-with": string;
  };
  plugins: Record<string, RegistryPluginData>;
}

export interface PluginSearchParams {
  tag?: string;
  query?: string;

}

export interface FilterValues {
  searchQuery?: string;
  logLevels: {
    error: boolean;
    warning: boolean;
    info: boolean;
    debug: boolean;
    trace: boolean;
  };
  date?: DateValue | undefined;
}

export interface Log {
  id: string;
  type: "info" | "warning" | "error" | "debug" | "trace";
  message: string;
  timestamp: string;
}

export interface InstalledPlugin {
  name?: string;
  version: string;
  enabled: boolean;
  installedAt: string;
  settings?: Record<string, unknown>;
  environment?: Record<string, unknown>;
  isDependency?: boolean; // Whether this plugin was installed as a dependency
  dependentPlugin?: string; // Which plugin this is a dependency for
  description?: string;
  authors?: string[];
  license?: string;
  homepage?: string;
  documentation?: string;
  repository?: string;
  tags?: string[];

}

export interface InstalledPlugin {
  name?: string;
  version: string;
  enabled: boolean;
  installedAt: string;
  settings?: Record<string, unknown>;
  environment?: Record<string, unknown>;
  isDependency?: boolean; // Whether this plugin was installed as a dependency
  dependentPlugin?: string; // Which plugin this is a dependency for
  description?: string;
  authors?: string[];
  license?: string;
  homepage?: string;
  documentation?: string;
  repository?: string;
  tags?: string[];
}