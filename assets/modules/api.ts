<<<<<<< configuration-with-registry
import type { PluginRegistry, PluginSearchParams, PluginMetadata } from "~/assets/types/typelist";

const REGISTRY_CONFIG = {
  local: {
    baseUrl: "http://localhost:3001",
    type: "local" as const
  },
  git: {
    baseUrl: "https://raw.githubusercontent.com/Celarye/discord-bot-plugins/refs/heads/master/",
    type: "git" as const
  }
=======
import type {
  PluginMetadata,
  PluginRegistry,
  PluginSearchParams,
} from "~/assets/types/typelist";

// Configuration - change this URL to switch between local mock server and git repository
const REGISTRY_CONFIG = {
  // For local development
  local: {
    baseUrl: "http://localhost:3001",
    type: "local" as const,
  },
  // For git repository (example URLs - replace with actual repository URLs)
  git: {
    baseUrl:
      "https://raw.githubusercontent.com/Celarye/discord-bot-plugins/refs/heads/master/",
    type: "git" as const,
  },
>>>>>>> master
};

interface VersionData {
  version: string;
  deprecated?: boolean;
}

<<<<<<< configuration-with-registry
const CURRENT_CONFIG_KEY: keyof typeof REGISTRY_CONFIG = "git"; // Change to "local" for development

=======
// Switch between local and git by changing this key
const CURRENT_CONFIG_KEY: keyof typeof REGISTRY_CONFIG = "git"; // Change to "local" for development

// Helper function to get current config
>>>>>>> master
function getCurrentConfig() {
  return REGISTRY_CONFIG[CURRENT_CONFIG_KEY];
}

<<<<<<< configuration-with-registry
=======
// Define interfaces locally (removed RegistryPlugin from imports to avoid conflict)
>>>>>>> master
interface PluginSettings {
  type: string;
  properties: Record<string, unknown>;
}

interface PluginDependency {
  name: string;
  url?: string;
  version?: string;
}

interface RegistryPlugin {
  name: string;
  description: string;
  versions?: unknown[];
  deprecated?: boolean;
  deprecatedReason?: string;
  updateTime?: string;
  authors: string[];
  license?: string;
  homepage?: string;
  documentation?: string;
  repository?: string;
  tags?: string[];
<<<<<<< configuration-with-registry
  environment?: string;
=======
  environment?: string; // Added missing environment field
>>>>>>> master
  settings?: PluginSettings;
  dependencies?: PluginDependency[];
}

<<<<<<< configuration-with-registry
=======
// Extended metadata interface for type safety
>>>>>>> master
interface ExtendedPluginMetadata extends PluginMetadata {
  environment?: string;
  settings?: PluginSettings;
  dependencies?: PluginDependency[];
}

/**
 * Get the latest version for a plugin from the registry
 */
<<<<<<< configuration-with-registry
async function getLatestPluginVersion(pluginName: string): Promise<string | null> {
=======
async function getLatestPluginVersion(
  pluginName: string,
): Promise<string | null> {
>>>>>>> master
  try {
    const registry = await fetchRegistry();
    const pluginData = registry.plugins[pluginName];

<<<<<<< configuration-with-registry
    if (!pluginData || !pluginData.versions || !Array.isArray(pluginData.versions) || pluginData.versions.length === 0) {
      return null;
    }

    const availableVersions = pluginData.versions.filter((v: VersionData) => !v.deprecated);
=======
    if (
      !pluginData ||
      !pluginData.versions ||
      !Array.isArray(pluginData.versions) ||
      pluginData.versions.length === 0
    ) {
      return null;
    }

    // Filter out deprecated versions
    const availableVersions = pluginData.versions.filter(
      (v: VersionData) => !v.deprecated,
    );
>>>>>>> master
    if (availableVersions.length === 0) {
      return null;
    }

<<<<<<< configuration-with-registry
    const sortedVersions = availableVersions.sort((a :VersionData, b: VersionData) => {
      const versionA = a.version.split('.').map(num => parseInt(num, 10));
      const versionB = b.version.split('.').map(num => parseInt(num, 10));

      for (let i = 0; i < Math.max(versionA.length, versionB.length); i++) {
        const numA = versionA[i] || 0;
        const numB = versionB[i] || 0;

        if (numA !== numB) {
          return numA - numB;
        }
      }
      return 0;
    });

=======
    // Sort versions to get the latest one (semantic version sorting)
    const sortedVersions = availableVersions.sort(
      (a: VersionData, b: VersionData) => {
        const versionA = a.version.split(".").map((num) => parseInt(num, 10));
        const versionB = b.version.split(".").map((num) => parseInt(num, 10));

        for (let i = 0; i < Math.max(versionA.length, versionB.length); i++) {
          const numA = versionA[i] || 0;
          const numB = versionB[i] || 0;

          if (numA !== numB) {
            return numA - numB;
          }
        }
        return 0;
      },
    );

    // Get the latest (highest) version
>>>>>>> master
    const latestVersion = sortedVersions[sortedVersions.length - 1];
    return latestVersion.version;
  } catch (error) {
    console.error(`Error getting latest version for ${pluginName}:`, error);
    return null;
  }
}

/**
 * Fetch plugin metadata from individual metadata file
 */
<<<<<<< configuration-with-registry
async function fetchPluginMetadata(pluginName: string): Promise<PluginMetadata> {
  try {
    const config = getCurrentConfig();

    if (config.type === "local") {
      const url = `${config.baseUrl}${pluginName}/metadata.json`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch metadata for ${pluginName}: ${response.statusText}`);
      }
      return await response.json();
    } else {
      const latestVersion = await getLatestPluginVersion(pluginName);
      if (!latestVersion) {
        throw new Error(`No valid version found for plugin ${pluginName}`);
      }

      const url = `${config.baseUrl}${pluginName}/${latestVersion}/metadata.json`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch metadata for ${pluginName} v${latestVersion}: ${response.statusText}`);
      }
      return await response.json();
    }
  } catch (error) {
    console.error(`Error fetching metadata for ${pluginName}:`, error);
    throw error;
  }
}

/**
 * Fetch the complete plugin registry
 */
export async function fetchRegistry(): Promise<PluginRegistry> {
  try {
    const config = getCurrentConfig();
    const url = config.type === "local"
        ? `${config.baseUrl}/plugins.json`
        : `${config.baseUrl}plugins.json`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch registry: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching registry:", error);
    throw new Error(`Failed to load plugin registry: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetch available plugins and convert to the expected format with metadata
 */
export async function fetchAvailable(): Promise<{ plugins: RegistryPlugin[] }> {
  try {
    const registry = await fetchRegistry();
    const plugins: RegistryPlugin[] = [];
    for (const [pluginName, pluginData] of Object.entries(registry.plugins)) {
      try {
        const metadata = await fetchPluginMetadata(pluginName);
        const extendedMetadata = metadata as ExtendedPluginMetadata;

        const plugin: RegistryPlugin = {
          name: pluginName,
          description: pluginData.description || metadata.description,
          versions: pluginData.versions || [],
          deprecated: pluginData.deprecated || metadata["plugin-deprecated"] || false,
          deprecatedReason: pluginData["deprecated-reason"] || metadata["plugin-deprecation-reason"],
          updateTime: pluginData["update-time"] || metadata["update-time"],
          // add metadata fields
          authors: metadata.authors || [],
          license: metadata.license,
          homepage: metadata.homepage,
          documentation: metadata.documentation,
          repository: metadata.repository,
          tags: metadata.tags || [],
          // use extended metadata with proper typing
          environment: extendedMetadata.environment,
          settings: extendedMetadata.settings,
          dependencies: extendedMetadata.dependencies || []
        };

        plugins.push(plugin);
      } catch (metadataError) {
        console.warn(`Failed to fetch metadata for ${pluginName}, using registry data only:`, metadataError);

        // fallback to registry data only
        const plugin: RegistryPlugin = {
          name: pluginName,
          description: pluginData.description,
          versions: pluginData.versions || [],
          deprecated: pluginData.deprecated || false,
          deprecatedReason: pluginData["deprecated-reason"],
          updateTime: pluginData["update-time"],
          authors: [],
          license: "Unknown",
          tags: [],
          // set undefined for missing fields in fallback
          environment: undefined,
          settings: undefined,
          dependencies: []
        };

        plugins.push(plugin);
      }
=======
async function fetchPluginMetadata(
  pluginName: string,
): Promise<PluginMetadata> {
  try {
    const config = getCurrentConfig();

    if (config.type === "local") {
      const url = `${config.baseUrl}${pluginName}/metadata.json`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch metadata for ${pluginName}: ${response.statusText}`,
        );
      }
      return await response.json();
    } else {
      // For git-based registry, we need to get the latest version first
      const latestVersion = await getLatestPluginVersion(pluginName);
      if (!latestVersion) {
        throw new Error(`No valid version found for plugin ${pluginName}`);
      }

      const url = `${config.baseUrl}${pluginName}/${latestVersion}/metadata.json`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch metadata for ${pluginName} v${latestVersion}: ${response.statusText}`,
        );
      }
      return await response.json();
    }
  } catch (error) {
    console.error(`Error fetching metadata for ${pluginName}:`, error);
    throw error;
  }
}

/**
 * Fetch the complete plugin registry
 */
export async function fetchRegistry(): Promise<PluginRegistry> {
  try {
    const config = getCurrentConfig();
    const url =
      config.type === "local"
        ? `${config.baseUrl}/plugins.json`
        : `${config.baseUrl}plugins.json`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch registry: ${response.statusText}`);
>>>>>>> master
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching registry:", error);
    throw new Error(
      `Failed to load plugin registry: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

<<<<<<< configuration-with-registry
=======
/**
 * Fetch available plugins and convert to the expected format with metadata
 */
export async function fetchAvailable(): Promise<{ plugins: RegistryPlugin[] }> {
  try {
    const registry = await fetchRegistry();
    const plugins: RegistryPlugin[] = [];
    // process plugin 1 by 1
    for (const [pluginName, pluginData] of Object.entries(registry.plugins)) {
      try {
        const metadata = await fetchPluginMetadata(pluginName);
        const extendedMetadata = metadata as ExtendedPluginMetadata;

        const plugin: RegistryPlugin = {
          name: pluginName,
          description: pluginData.description || metadata.description,
          versions: pluginData.versions || [],
          deprecated:
            pluginData.deprecated || metadata["plugin-deprecated"] || false,
          deprecatedReason:
            pluginData["deprecated-reason"] ||
            metadata["plugin-deprecation-reason"],
          updateTime: pluginData["update-time"] || metadata["update-time"],
          // add metadata fields
          authors: metadata.authors || [],
          license: metadata.license,
          homepage: metadata.homepage,
          documentation: metadata.documentation,
          repository: metadata.repository,
          tags: metadata.tags || [],
          // Use extended metadata with proper typing
          environment: extendedMetadata.environment,
          settings: extendedMetadata.settings,
          dependencies: extendedMetadata.dependencies || [],
        };

        plugins.push(plugin);
      } catch (metadataError) {
        console.warn(
          `Failed to fetch metadata for ${pluginName}, using registry data only:`,
          metadataError,
        );

        // fallback to registry data only
        const plugin: RegistryPlugin = {
          name: pluginName,
          description: pluginData.description,
          versions: pluginData.versions || [],
          deprecated: pluginData.deprecated || false,
          deprecatedReason: pluginData["deprecated-reason"],
          updateTime: pluginData["update-time"],
          authors: [],
          license: "Unknown",
          tags: [],
          // Set undefined for missing fields in fallback
          environment: undefined,
          settings: undefined,
          dependencies: [],
        };

        plugins.push(plugin);
      }
    }

>>>>>>> master
    return { plugins };
  } catch (error) {
    console.error("Error fetching available plugins:", error);
    throw error;
  }
}

<<<<<<< configuration-with-registry
export async function fetchPluginDetails(pluginName: string): Promise<RegistryPlugin> {
=======
export async function fetchPluginDetails(
  pluginName: string,
): Promise<RegistryPlugin> {
>>>>>>> master
  try {
    const config = getCurrentConfig();

    if (config.type === "local") {
      const response = await fetch(`${config.baseUrl}/registry/${pluginName}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Plugin '${pluginName}' not found`);
        }
<<<<<<< configuration-with-registry
        throw new Error(`Failed to fetch plugin details: ${response.statusText}`);
=======
        throw new Error(
          `Failed to fetch plugin details: ${response.statusText}`,
        );
>>>>>>> master
      }

      const pluginData = await response.json();

      try {
        const metadata = await fetchPluginMetadata(pluginName);
        const extendedMetadata = metadata as ExtendedPluginMetadata;

        return {
          ...pluginData,
          authors: metadata.authors || [],
          license: metadata.license || "Unknown",
          homepage: metadata.homepage,
          documentation: metadata.documentation,
          repository: metadata.repository,
          tags: metadata.tags || [],
<<<<<<< configuration-with-registry
          // use extended metadata with proper typing
          environment: extendedMetadata.environment,
          settings: extendedMetadata.settings,
          dependencies: extendedMetadata.dependencies || []
=======
          // Use extended metadata with proper typing
          environment: extendedMetadata.environment,
          settings: extendedMetadata.settings,
          dependencies: extendedMetadata.dependencies || [],
>>>>>>> master
        };
      } catch {
        return {
          ...pluginData,
          authors: [],
          license: "Unknown",
          tags: [],
<<<<<<< configuration-with-registry
          // set undefined for missing fields in fallback
          environment: undefined,
          settings: undefined,
          dependencies: []
=======
          // Set undefined for missing fields in fallback
          environment: undefined,
          settings: undefined,
          dependencies: [],
>>>>>>> master
        };
      }
    } else {
      const registry = await fetchRegistry();
      const pluginData = registry.plugins[pluginName];

      if (!pluginData) {
        throw new Error(`Plugin '${pluginName}' not found`);
      }

      const metadata = await fetchPluginMetadata(pluginName);
      const extendedMetadata = metadata as ExtendedPluginMetadata;

      return {
        name: pluginName,
        description: pluginData.description || metadata.description,
        versions: pluginData.versions || [],
<<<<<<< configuration-with-registry
        deprecated: pluginData.deprecated || metadata["plugin-deprecated"] || false,
        deprecatedReason: pluginData["deprecated-reason"] || metadata["plugin-deprecation-reason"],
=======
        deprecated:
          pluginData.deprecated || metadata["plugin-deprecated"] || false,
        deprecatedReason:
          pluginData["deprecated-reason"] ||
          metadata["plugin-deprecation-reason"],
>>>>>>> master
        updateTime: pluginData["update-time"] || metadata["update-time"],
        authors: metadata.authors || [],
        license: metadata.license || "Unknown",
        homepage: metadata.homepage,
        documentation: metadata.documentation,
        repository: metadata.repository,
        tags: metadata.tags || [],
<<<<<<< configuration-with-registry
        // use extended metadata with proper typing
        environment: extendedMetadata.environment,
        settings: extendedMetadata.settings,
        dependencies: extendedMetadata.dependencies || []
=======
        // Use extended metadata with proper typing
        environment: extendedMetadata.environment,
        settings: extendedMetadata.settings,
        dependencies: extendedMetadata.dependencies || [],
>>>>>>> master
      };
    }
  } catch (error) {
    console.error("Error fetching plugin details:", error);
    throw error;
  }
}

/**
 * Search plugins in the registry
 */
<<<<<<< configuration-with-registry
export async function searchPlugins(params: PluginSearchParams): Promise<{ count: number; plugins: RegistryPlugin[] }> {
=======
export async function searchPlugins(
  params: PluginSearchParams,
): Promise<{ count: number; plugins: RegistryPlugin[] }> {
>>>>>>> master
  try {
    const config = getCurrentConfig();

    if (config.type === "local") {
      const searchParams = new URLSearchParams();
<<<<<<< configuration-with-registry
      if (params.tag) searchParams.append('tag', params.tag);
      if (params.query) searchParams.append('query', params.query);

      const response = await fetch(`${config.baseUrl}/registry/search?${searchParams}`);
      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
=======
      if (params.tag) searchParams.append("tag", params.tag);
      if (params.query) searchParams.append("query", params.query);

      const response = await fetch(
        `${config.baseUrl}/registry/search?${searchParams}`,
      );
      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`); // Fixed: was missing 'throw'
>>>>>>> master
      }

      const result = await response.json();

      const enhancedPlugins: RegistryPlugin[] = [];
      for (const plugin of result.plugins) {
        try {
          const metadata = await fetchPluginMetadata(plugin.name);
          const extendedMetadata = metadata as ExtendedPluginMetadata;

          enhancedPlugins.push({
            ...plugin,
            authors: metadata.authors || [],
            license: metadata.license || "Unknown",
            homepage: metadata.homepage,
            documentation: metadata.documentation,
            repository: metadata.repository,
            tags: metadata.tags || plugin.tags || [],
<<<<<<< configuration-with-registry
            // use extended metadata with proper typing
            environment: extendedMetadata.environment,
            settings: extendedMetadata.settings,
            dependencies: extendedMetadata.dependencies || []
=======
            // Use extended metadata with proper typing
            environment: extendedMetadata.environment,
            settings: extendedMetadata.settings,
            dependencies: extendedMetadata.dependencies || [],
>>>>>>> master
          });
        } catch {
          enhancedPlugins.push({
            ...plugin,
            authors: [],
            license: "Unknown",
            tags: plugin.tags || [],
            environment: undefined,
            settings: undefined,
<<<<<<< configuration-with-registry
            dependencies: []
=======
            dependencies: [],
>>>>>>> master
          });
        }
      }

      return {
        count: enhancedPlugins.length,
<<<<<<< configuration-with-registry
        plugins: enhancedPlugins
=======
        plugins: enhancedPlugins,
>>>>>>> master
      };
    } else {
      const { plugins } = await fetchAvailable();
      let filteredPlugins = plugins;

      if (params.tag) {
<<<<<<< configuration-with-registry
        filteredPlugins = filteredPlugins.filter(plugin =>
            plugin.tags?.includes(params.tag!)
=======
        filteredPlugins = filteredPlugins.filter((plugin) =>
          plugin.tags?.includes(params.tag!),
>>>>>>> master
        );
      }

      if (params.query) {
        const searchQuery = params.query.toLowerCase();
<<<<<<< configuration-with-registry
        filteredPlugins = filteredPlugins.filter(plugin =>
            plugin.name.toLowerCase().includes(searchQuery) ||
            plugin.description.toLowerCase().includes(searchQuery) ||
            plugin.tags?.some(tag => tag.toLowerCase().includes(searchQuery))
=======
        filteredPlugins = filteredPlugins.filter(
          (plugin) =>
            plugin.name.toLowerCase().includes(searchQuery) ||
            plugin.description.toLowerCase().includes(searchQuery) ||
            plugin.tags?.some((tag) => tag.toLowerCase().includes(searchQuery)),
>>>>>>> master
        );
      }

      return {
        count: filteredPlugins.length,
<<<<<<< configuration-with-registry
        plugins: filteredPlugins
=======
        plugins: filteredPlugins,
>>>>>>> master
      };
    }
  } catch (error) {
    console.error("Error searching plugins:", error);
    throw error;
  }
}

/**
 * Get all unique tags from the registry and metadata
 */
export async function fetchTags(): Promise<string[]> {
  try {
    const { plugins } = await fetchAvailable();
    const allTags = new Set<string>();

<<<<<<< configuration-with-registry
    plugins.forEach(plugin => {
      plugin.tags?.forEach(tag => allTags.add(tag));
=======
    plugins.forEach((plugin) => {
      plugin.tags?.forEach((tag) => allTags.add(tag));
>>>>>>> master
    });

    return Array.from(allTags).sort();
  } catch (error) {
    console.error("Error fetching tags:", error);
    return [];
  }
}

/**
 * Check if the registry is available
 */
export async function checkRegistryHealth(): Promise<boolean> {
  try {
    const config = getCurrentConfig();

    if (config.type === "local") {
      const response = await fetch(`${config.baseUrl}/registry/info`);
      return response.ok;
    } else {
      // For git-based registry, check if registry.json is accessible
      const response = await fetch(`${config.baseUrl}plugins.json`);
      return response.ok;
    }
  } catch (error) {
    console.error("Registry health check failed:", error);
    return false;
  }
}
