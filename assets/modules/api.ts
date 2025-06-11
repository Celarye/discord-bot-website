import type { PluginRegistry, RegistryPlugin, PluginSearchParams, PluginMetadata } from "~/assets/types/typelist";

// Configuration - change this URL to switch between local mock server and git repository
const REGISTRY_CONFIG = {
  // For local development
  local: {
    baseUrl: "http://localhost:3001",
    type: "local" as const
  },
  // For git repository (example URLs - replace with actual repository URLs)
  git: {
    baseUrl: "https://raw.githubusercontent.com/vihoman/registry-test/main/",
    type: "git" as const
  }
};

// Switch between local and git by changing this key
const CURRENT_CONFIG_KEY: keyof typeof REGISTRY_CONFIG = "git"; // Change to "local" for development

// Helper function to get current config
function getCurrentConfig() {
  return REGISTRY_CONFIG[CURRENT_CONFIG_KEY];
}

/**
 * Fetch plugin metadata from individual metadata file
 */
async function fetchPluginMetadata(pluginName: string): Promise<PluginMetadata> {
  try {
    const config = getCurrentConfig();
    const url = config.type === "local"
        ? `${config.baseUrl}/plugins/${pluginName}/metadata.json`
        : `${config.baseUrl}/plugins/${pluginName}/metadata.json`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata for ${pluginName}: ${response.statusText}`);
    }
    return await response.json();
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
        ? `${config.baseUrl}/registry.json`
        : `${config.baseUrl}/registry.json`;

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

    // Process each plugin from the registry
    for (const [pluginName, pluginData] of Object.entries(registry.plugins)) {
      try {
        const metadata = await fetchPluginMetadata(pluginName);
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
          tags: metadata.tags || []
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
          tags: []
        };

        plugins.push(plugin);
      }
    }

    return { plugins };
  } catch (error) {
    console.error("Error fetching available plugins:", error);
    throw error;
  }
}

/**
 * Search plugins in the registry
 */
export async function searchPlugins(params: PluginSearchParams): Promise<{ count: number; plugins: RegistryPlugin[] }> {
  try {
    const config = getCurrentConfig();

    if (config.type === "local") {
      const searchParams = new URLSearchParams();
      if (params.tag) searchParams.append('tag', params.tag);
      if (params.query) searchParams.append('query', params.query);

      const response = await fetch(`${config.baseUrl}/registry/search?${searchParams}`);
      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const result = await response.json();

      const enhancedPlugins: RegistryPlugin[] = [];
      for (const plugin of result.plugins) {
        try {
          const metadata = await fetchPluginMetadata(plugin.name);
          enhancedPlugins.push({
            ...plugin,
            authors: metadata.authors || [],
            license: metadata.license || "Unknown",
            homepage: metadata.homepage,
            documentation: metadata.documentation,
            repository: metadata.repository,
            tags: metadata.tags || plugin.tags || []
          });
        } catch {
          enhancedPlugins.push({
            ...plugin,
            authors: [],
            license: "Unknown",
            tags: plugin.tags || []
          });
        }
      }

      return {
        count: enhancedPlugins.length,
        plugins: enhancedPlugins
      };
    } else {
      const { plugins } = await fetchAvailable();
      let filteredPlugins = plugins;

      if (params.tag) {
        filteredPlugins = filteredPlugins.filter(plugin =>
            plugin.tags?.includes(params.tag!)
        );
      }

      if (params.query) {
        const searchQuery = params.query.toLowerCase();
        filteredPlugins = filteredPlugins.filter(plugin =>
            plugin.name.toLowerCase().includes(searchQuery) ||
            plugin.description.toLowerCase().includes(searchQuery) ||
            plugin.tags?.some(tag => tag.toLowerCase().includes(searchQuery))
        );
      }

      return {
        count: filteredPlugins.length,
        plugins: filteredPlugins
      };
    }
  } catch (error) {
    console.error("Error searching plugins:", error);
    throw error;
  }
}

/**
 * Fetch specific plugin details with metadata
 */
export async function fetchPluginDetails(pluginName: string): Promise<RegistryPlugin> {
  try {
    const config = getCurrentConfig();

    if (config.type === "local") {
      const response = await fetch(`${config.baseUrl}/registry/plugins/${pluginName}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Plugin '${pluginName}' not found`);
        }
        throw new Error(`Failed to fetch plugin details: ${response.statusText}`);
      }

      const pluginData = await response.json();

      try {
        const metadata = await fetchPluginMetadata(pluginName);
        return {
          ...pluginData,
          authors: metadata.authors || [],
          license: metadata.license || "Unknown",
          homepage: metadata.homepage,
          documentation: metadata.documentation,
          repository: metadata.repository,
          tags: metadata.tags || []
        };
      } catch {
        return {
          ...pluginData,
          authors: [],
          license: "Unknown",
          tags: []
        };
      }
    } else {
      const registry = await fetchRegistry();
      const pluginData = registry.plugins[pluginName];

      if (!pluginData) {
        throw new Error(`Plugin '${pluginName}' not found`);
      }

      const metadata = await fetchPluginMetadata(pluginName);

      return {
        name: pluginName,
        description: pluginData.description || metadata.description,
        versions: pluginData.versions || [],
        deprecated: pluginData.deprecated || metadata["plugin-deprecated"] || false,
        deprecatedReason: pluginData["deprecated-reason"] || metadata["plugin-deprecation-reason"],
        updateTime: pluginData["update-time"] || metadata["update-time"],
        authors: metadata.authors || [],
        license: metadata.license || "Unknown",
        homepage: metadata.homepage,
        documentation: metadata.documentation,
        repository: metadata.repository,
        tags: metadata.tags || []
      };
    }
  } catch (error) {
    console.error("Error fetching plugin details:", error);
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

    plugins.forEach(plugin => {
      plugin.tags?.forEach(tag => allTags.add(tag));
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
      const response = await fetch(`${config.baseUrl}/registry.json`);
      return response.ok;
    }
  } catch (error) {
    console.error("Registry health check failed:", error);
    return false;
  }
}