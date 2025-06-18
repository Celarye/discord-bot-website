import fs from "fs";
import path from "path";
import yaml from "yaml";
import { defineEventHandler, readBody } from "h3";
import type { InstalledPlugin } from "~/assets/types/typelist";

interface PluginConfig {
  plugins: Record<string, Omit<InstalledPlugin, 'name'>>;
  metadata?: {
    lastUpdated: string;
    version: string;
  };
}

interface PluginSettings {
  [key: string]: string | number | boolean | PluginSettings | Array<string | number | boolean>;
}

interface PluginEnvironment {
  [key: string]: string | number | boolean;
}

interface AddPluginRequest {
  name: string;
  version: string;
  enabled?: boolean;
  settings?: PluginSettings;
  environment?: PluginEnvironment;
  dependencies?: Array<{
    name: string;
    url?: string;
    version?: string;
  }>;
}

interface VersionData {
  version: string;
  deprecated?: boolean;
}

interface RegistryPluginData {
  deprecated?: boolean;
  versions?: VersionData[];
}

interface RegistryData {
  plugins: Record<string, RegistryPluginData>;
}

// JSON Schema property definition
interface JSONSchemaProperty {
  type?: string;
  default?: string | number | boolean | object | unknown[];
  description?: string;
  enum?: unknown[];
  items?: JSONSchemaProperty;
  properties?: Record<string, JSONSchemaProperty>;
  required?: string[];
  [key: string]: unknown;
}

// Metadata structure from the plugin's metadata.json
interface PluginMetadata {
  name: string;
  version: string;
  description: string;
  environment?: Record<string, boolean>; // true = required, false/undefined = optional
  settings?: {
    $schema?: string;
    title?: string;
    type: string;
    properties?: Record<string, JSONSchemaProperty>;
    required?: string[];
  };
  dependencies?: Array<{
    name: string;
    version?: string;
    registry?: string;
  }>;
  authors?: string[];
  license?: string;
  [key: string]: unknown;
}

interface PluginUpdateRequest {
  environment?: PluginEnvironment | null;
  settings?: PluginSettings | null;
  enabled?: boolean;
  dependencies?: Array<{
    name: string;
    url?: string;
    version?: string;
  }> | null;
}

interface ExtendedInstalledPlugin extends Omit<InstalledPlugin, 'name'> {
  isDependency?: boolean;
  dependentPlugin?: string;
}

async function fetchPluginDataFromRegistry(pluginName: string): Promise<{
  version: string;
  environmentSchema?: Record<string, boolean>;
  settingsSchema?: PluginMetadata['settings'];
  defaultEnvironment?: PluginEnvironment;
  defaultSettings?: PluginSettings;
} | null> {
  try {
    const registryUrl = `https://raw.githubusercontent.com/Celarye/discord-bot-plugins/refs/heads/master/plugins.json`;
    const response = await fetch(registryUrl);

    if (!response.ok) {
      return null;
    }

    const responseText = await response.text();
    const registryData: RegistryData = JSON.parse(responseText);

    if (!registryData.plugins || !registryData.plugins[pluginName]) {
      return null;
    }

    const pluginData = registryData.plugins[pluginName];

    if (!pluginData.versions || !Array.isArray(pluginData.versions) || pluginData.versions.length === 0) {
      return null;
    }

    // Get latest non-deprecated version
    const availableVersions = pluginData.versions.filter((v: VersionData) => !v.deprecated);
    if (availableVersions.length === 0) {
      return null;
    }

    // Sort versions to get the latest one (semantic version sorting)
    const sortedVersions = availableVersions.sort((a: VersionData, b: VersionData) => {
      const versionA = a.version.split('.').map((num: string) => parseInt(num, 10));
      const versionB = b.version.split('.').map((num: string) => parseInt(num, 10));

      for (let i = 0; i < Math.max(versionA.length, versionB.length); i++) {
        const numA = versionA[i] || 0;
        const numB = versionB[i] || 0;

        if (numA !== numB) {
          return numA - numB;
        }
      }
      return 0;
    });

    const targetVersion = sortedVersions[sortedVersions.length - 1];
    if (!targetVersion) {
      return null;
    }

    console.log("target version: " + targetVersion.version);

    // Fetch metadata.json for schema information
    const metadataUrl = `https://raw.githubusercontent.com/Celarye/discord-bot-plugins/refs/heads/master/${pluginName}/${targetVersion.version}/metadata.json`;

    let environmentSchema: Record<string, boolean> | undefined = undefined;
    let settingsSchema: PluginMetadata['settings'] | undefined = undefined;
    const defaultEnvironment: PluginEnvironment = {};
    const defaultSettings: PluginSettings = {};

    try {
      const metadataResponse = await fetch(metadataUrl);
      if (metadataResponse.ok) {
        const metadataText = await metadataResponse.text();
        const metadata: PluginMetadata = JSON.parse(metadataText);

        if (metadata.environment && typeof metadata.environment === 'object' && !Array.isArray(metadata.environment)) {
          environmentSchema = metadata.environment;

          Object.entries(metadata.environment).forEach(([key, required]) => {
            if (required) {
              defaultEnvironment[key] = '';
            }
          });
        }

        // Settings schema: JSON Schema definition
        if (metadata.settings && typeof metadata.settings === 'object') {
          settingsSchema = metadata.settings;

          // Extract default values from JSON Schema
          if (metadata.settings.properties) {
            Object.entries(metadata.settings.properties).forEach(([key, propSchema]: [string, JSONSchemaProperty]) => {
              if (propSchema.default !== undefined) {
                defaultSettings[key] = propSchema.default as string | number | boolean | PluginSettings | Array<string | number | boolean>;
              }
            });
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to fetch metadata for ${pluginName}:`, error);
    }

    return {
      version: targetVersion.version,
      environmentSchema,
      settingsSchema,
      defaultEnvironment: Object.keys(defaultEnvironment).length > 0 ? defaultEnvironment : undefined,
      defaultSettings: Object.keys(defaultSettings).length > 0 ? defaultSettings : undefined
    };

  } catch (error) {
    console.error(`Error fetching plugin data for ${pluginName}:`, error);
    return null;
  }
}

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;
  const configPath = path.resolve('config.yaml');

  if (method === "GET") {
    try {
      if (fs.existsSync(configPath)) {
        const content = fs.readFileSync(configPath, "utf8");
        return yaml.parse(content);
      } else {
        const defaultConfig: PluginConfig = {
          plugins: {},
          metadata: {
            lastUpdated: new Date().toISOString(),
            version: "1.0.0"
          }
        };
        return defaultConfig;
      }
    } catch (error) {
      event.node.res.statusCode = 500;
      return {
        error: `Failed to read configuration: ${(error as Error).message}`,
      };
    }
  }

  if (method === "POST") {
    try {
      const pluginsDir = path.dirname(configPath);
      if (!fs.existsSync(pluginsDir)) {
        fs.mkdirSync(pluginsDir, { recursive: true });
      }

      const body = await readBody(event);

      if (body.action === 'add-plugin') {
        const pluginData: AddPluginRequest = body.plugin;

        if (!pluginData.name || !pluginData.version) {
          event.node.res.statusCode = 400;
          return {
            error: "Invalid plugin data: name and version are required"
          };
        }

        let config: PluginConfig = { plugins: {} };
        if (fs.existsSync(configPath)) {
          const content = fs.readFileSync(configPath, "utf8");
          config = yaml.parse(content);
        }

        if (config.plugins[pluginData.name]) {
          event.node.res.statusCode = 409;
          return {
            error: "Plugin already installed"
          };
        }

        const now = new Date().toISOString();
        const registryData = await fetchPluginDataFromRegistry(pluginData.name);

        const finalEnvironment: PluginEnvironment = {
          ...(registryData?.defaultEnvironment || {}),
          ...(pluginData.environment || {})
        };

        const finalSettings: PluginSettings = {
          ...(registryData?.defaultSettings || {}),
          ...(pluginData.settings || {})
        };

        const newPluginData: Omit<InstalledPlugin, 'name'> & { dependencies?: Array<{ name: string; url?: string; version?: string; }> } = {
          version: registryData?.version || pluginData.version,
          enabled: pluginData.enabled !== undefined ? pluginData.enabled : true,
          installedAt: now,
          ...(Object.keys(finalEnvironment).length > 0 && { environment: finalEnvironment }),
          ...(Object.keys(finalSettings).length > 0 && { settings: finalSettings })
        };

        config.plugins[pluginData.name] = newPluginData;

        if (pluginData.dependencies && pluginData.dependencies.length > 0) {
          const dependencyPromises = pluginData.dependencies.map(async (dep) => {
            if (!config.plugins[dep.name]) {
              const depRegistryData = await fetchPluginDataFromRegistry(dep.name);

              if (!depRegistryData) {
                return null;
              }

              const dependencyPluginData: Omit<InstalledPlugin, 'name'> = {
                version: depRegistryData.version,
                enabled: true,
                installedAt: now,
                ...(depRegistryData.defaultEnvironment && Object.keys(depRegistryData.defaultEnvironment).length > 0 && {
                  environment: depRegistryData.defaultEnvironment
                }),
                ...(depRegistryData.defaultSettings && Object.keys(depRegistryData.defaultSettings).length > 0 && {
                  settings: depRegistryData.defaultSettings
                })
              };

              return { name: dep.name, data: dependencyPluginData };
            }
            return null;
          });

          const resolvedDependencies = await Promise.all(dependencyPromises);

          resolvedDependencies.forEach(dep => {
            if (dep) {
              config.plugins[dep.name] = dep.data;
            }
          });
        }

        config.metadata = {
          lastUpdated: now,
          version: config.metadata?.version || "1.0.0"
        };

        fs.writeFileSync(configPath, yaml.stringify(config, {
          indent: 2,
          lineWidth: 0,
          minContentWidth: 0,
          doubleQuotedAsJSON: false
        }));

        return {
          success: true,
          message: `Plugin ${pluginData.name} installed successfully`,
          plugin: { name: pluginData.name, ...newPluginData },
          dependenciesInstalled: pluginData.dependencies?.length || 0
        };
      }

      let config: PluginConfig;
      if (typeof body === 'string') {
        config = yaml.parse(body);
      } else {
        config = body;
      }

      if (!config.plugins) {
        event.node.res.statusCode = 400;
        return {
          error: "Invalid configuration: plugins object is required"
        };
      }

      if (Array.isArray(config.plugins)) {
        event.node.res.statusCode = 400;
        return {
          error: "Invalid configuration: plugins must be an object, not an array"
        };
      }

      for (const [pluginName, pluginData] of Object.entries(config.plugins)) {
        if (!pluginName || typeof pluginName !== 'string') {
          event.node.res.statusCode = 400;
          return {
            error: "Invalid plugin structure: plugin name must be a valid string"
          };
        }

        if (!pluginData || typeof pluginData !== 'object') {
          event.node.res.statusCode = 400;
          return {
            error: `Invalid plugin structure for ${pluginName}: plugin data must be an object`
          };
        }

        if (!pluginData.version || typeof pluginData.version !== 'string') {
          event.node.res.statusCode = 400;
          return {
            error: `Invalid plugin structure for ${pluginName}: version is required and must be a string`
          };
        }
      }

      config.metadata = {
        lastUpdated: new Date().toISOString(),
        version: config.metadata?.version || "1.0.0"
      };

      fs.writeFileSync(configPath, yaml.stringify(config, {
        indent: 2,
        lineWidth: 0,
        minContentWidth: 0,
        doubleQuotedAsJSON: false
      }));

      return { success: true, message: "Configuration saved successfully" };
    } catch (error) {
      event.node.res.statusCode = 500;
      return {
        success: false,
        error: `Failed to save configuration: ${(error as Error).message}`,
      };
    }
  }

  if (method === "PUT") {
    try {
      const body = await readBody(event);
      const { pluginName, updates }: { pluginName: string; updates: PluginUpdateRequest } = body;

      if (!pluginName) {
        event.node.res.statusCode = 400;
        return { error: "Plugin name is required" };
      }

      let config: PluginConfig = { plugins: {} };

      if (fs.existsSync(configPath)) {
        const content = fs.readFileSync(configPath, "utf8");
        config = yaml.parse(content);
      }

      if (!config.plugins[pluginName]) {
        event.node.res.statusCode = 404;
        return { error: "Plugin not found" };
      }

      const currentPlugin = config.plugins[pluginName];
      const updatedPluginData: Omit<InstalledPlugin, 'name'> & { dependencies?: Array<{ name: string; url?: string; version?: string; }> } = {
        version: currentPlugin.version,
        enabled: currentPlugin.enabled,
        installedAt: currentPlugin.installedAt
      };

      if ('environment' in updates) {
        if (updates.environment === undefined || updates.environment === null) {
          console.log('undefined')
        } else if (updates.environment && typeof updates.environment === 'object') {
          if (Object.keys(updates.environment).length > 0) {
            updatedPluginData.environment = {
              ...(currentPlugin.environment || {}),
              ...updates.environment
            };
          }
        }
      } else if (currentPlugin.environment) {
        updatedPluginData.environment = currentPlugin.environment;
      }

      if ('settings' in updates) {
        if (updates.settings === undefined || updates.settings === null) {
          console.log('undefined')
        } else if (updates.settings && typeof updates.settings === 'object') {
          if (Object.keys(updates.settings).length > 0) {
            updatedPluginData.settings = updates.settings;
          }
        }
      } else if (currentPlugin.settings) {
        updatedPluginData.settings = currentPlugin.settings;
      }

      if ('enabled' in updates && updates.enabled !== undefined) {
        updatedPluginData.enabled = updates.enabled;
      }

      if ('dependencies' in updates) {
        if (updates.dependencies === undefined || updates.dependencies === null) {
          // Dependencies will be omitted from updatedPluginData
        } else if (Array.isArray(updates.dependencies) && updates.dependencies.length > 0) {
          updatedPluginData.dependencies = updates.dependencies;
        }
      } else if ('dependencies' in currentPlugin && currentPlugin.dependencies) {
        updatedPluginData.dependencies = Array.isArray(currentPlugin.dependencies)
            ? currentPlugin.dependencies
            : [];
      }

      config.plugins[pluginName] = updatedPluginData;

      config.metadata = {
        lastUpdated: new Date().toISOString(),
        version: config.metadata?.version || "1.0.0"
      };

      fs.writeFileSync(configPath, yaml.stringify(config, {
        indent: 2,
        lineWidth: 0,
        minContentWidth: 0,
        doubleQuotedAsJSON: false
      }));

      return {
        success: true,
        message: "Plugin updated successfully",
        plugin: { name: pluginName, ...config.plugins[pluginName] }
      };
    } catch (error) {
      event.node.res.statusCode = 500;
      return {
        success: false,
        error: `Failed to update plugin: ${(error as Error).message}`,
      };
    }
  }

  if (method === "DELETE") {
    try {
      const url = new URL(event.node.req.url!, `http://${event.node.req.headers.host}`);
      const pluginName = url.searchParams.get('name');

      if (!pluginName) {
        event.node.res.statusCode = 400;
        return { error: "Plugin name is required" };
      }

      let config: PluginConfig = { plugins: {} };

      if (fs.existsSync(configPath)) {
        const content = fs.readFileSync(configPath, "utf8");
        config = yaml.parse(content);
      }

      if (!config.plugins[pluginName]) {
        event.node.res.statusCode = 404;
        return { error: "Plugin not found" };
      }

      const originalCount = Object.keys(config.plugins).length;

      // Create new plugins object without the target plugin
      const { [pluginName]: removedPlugin, ...remainingPlugins } = config.plugins;

      // Find and remove dependent plugins
      const pluginsToKeep: Record<string, Omit<InstalledPlugin, 'name'>> = {};

      for (const [key, plugin] of Object.entries(remainingPlugins)) {
        const extendedPlugin = plugin as ExtendedInstalledPlugin;
        if (!(extendedPlugin.isDependency && extendedPlugin.dependentPlugin === pluginName)) {
          pluginsToKeep[key] = plugin;
        }
      }

      config.plugins = pluginsToKeep;

      const newCount = Object.keys(config.plugins).length;
      const removedCount = originalCount - newCount;

      config.metadata = {
        lastUpdated: new Date().toISOString(),
        version: config.metadata?.version || "1.0.0"
      };

      fs.writeFileSync(configPath, yaml.stringify(config, {
        indent: 2,
        lineWidth: 0,
        minContentWidth: 0,
        doubleQuotedAsJSON: false
      }));

      return {
        success: true,
        message: `Plugin removed successfully${removedCount > 1 ? ` (${removedCount - 1} dependencies also removed)` : ''}`
      };
    } catch (error) {
      event.node.res.statusCode = 500;
      return {
        success: false,
        error: `Failed to remove plugin: ${(error as Error).message}`,
      };
    }
  }

  event.node.res.statusCode = 405;
  return { error: "Method not allowed" };
});