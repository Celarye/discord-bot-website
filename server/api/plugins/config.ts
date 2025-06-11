import fs from "fs";
import path from "path";
import { defineEventHandler, readBody } from "h3";
import type { InstalledPlugin } from "~/assets/types/typelist";

interface PluginConfig {
  plugins: InstalledPlugin[];
  metadata?: {
    lastUpdated: string;
    version: string;
  };
}

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;
  const configPath = path.resolve("plugins", "plugins.json");

  // GET request - return the current configuration
  if (method === "GET") {
    try {
      if (fs.existsSync(configPath)) {
        const content = fs.readFileSync(configPath, "utf8");
        return JSON.parse(content);
      } else {
        const defaultConfig: PluginConfig = {
          plugins: [],
          metadata: {
            lastUpdated: new Date().toISOString(),
            version: "1.0.0"
          }
        };
        return defaultConfig;
      }
    } catch (error) {
      console.error("Error reading plugin configuration:", error);
      event.node.res.statusCode = 500;
      return {
        error: `Failed to read configuration: ${(error as Error).message}`,
      };
    }
  }

  // POST request - save new configuration
  if (method === "POST") {
    try {
      const pluginsDir = path.dirname(configPath);
      if (!fs.existsSync(pluginsDir)) {
        fs.mkdirSync(pluginsDir, { recursive: true });
      }

      const body = await readBody(event);

      let config: PluginConfig;
      if (typeof body === 'string') {
        config = JSON.parse(body);
      } else {
        config = body;
      }

      if (!config.plugins || !Array.isArray(config.plugins)) {
        event.node.res.statusCode = 400;
        return {
          error: "Invalid configuration: plugins array is required"
        };
      }

      // Validate plugin structure
      for (const plugin of config.plugins) {
        if (!plugin.name || !plugin.version) {
          event.node.res.statusCode = 400;
          return {
            error: "Invalid plugin structure: name and version are required"
          };
        }
      }

      config.metadata = {
        lastUpdated: new Date().toISOString(),
        version: config.metadata?.version || "1.0.0"
      };

      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      return { success: true, message: "Configuration saved successfully" };
    } catch (error) {
      console.error("Error saving plugin configuration:", error);
      event.node.res.statusCode = 500;
      return {
        success: false,
        error: `Failed to save configuration: ${(error as Error).message}`,
      };
    }
  }

  // PUT request - update specific plugin
  if (method === "PUT") {
    try {
      const body = await readBody(event);
      const { pluginName, updates } = body;

      if (!pluginName) {
        event.node.res.statusCode = 400;
        return { error: "Plugin name is required" };
      }

      let config: PluginConfig = { plugins: [] };

      if (fs.existsSync(configPath)) {
        const content = fs.readFileSync(configPath, "utf8");
        config = JSON.parse(content);
      }

      const pluginIndex = config.plugins.findIndex(p => p.name === pluginName);

      if (pluginIndex === -1) {
        event.node.res.statusCode = 404;
        return { error: "Plugin not found" };
      }

      // Merge updates while preserving required fields
      config.plugins[pluginIndex] = {
        ...config.plugins[pluginIndex],
        ...updates,
        // Ensure required fields are not removed
        name: config.plugins[pluginIndex].name,
        version: updates.version || config.plugins[pluginIndex].version,
        enabled: updates.enabled !== undefined ? updates.enabled : config.plugins[pluginIndex].enabled,
        installedAt: config.plugins[pluginIndex].installedAt
      };

      config.metadata = {
        lastUpdated: new Date().toISOString(),
        version: config.metadata?.version || "1.0.0"
      };

      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      return {
        success: true,
        message: "Plugin updated successfully",
        plugin: config.plugins[pluginIndex]
      };
    } catch (error) {
      console.error("Error updating plugin configuration:", error);
      event.node.res.statusCode = 500;
      return {
        success: false,
        error: `Failed to update plugin: ${(error as Error).message}`,
      };
    }
  }

  // DELETE request - remove plugin
  if (method === "DELETE") {
    try {
      const url = new URL(event.node.req.url!, `http://${event.node.req.headers.host}`);
      const pluginName = url.searchParams.get('name');

      if (!pluginName) {
        event.node.res.statusCode = 400;
        return { error: "Plugin name is required" };
      }

      let config: PluginConfig = { plugins: [] };

      if (fs.existsSync(configPath)) {
        const content = fs.readFileSync(configPath, "utf8");
        config = JSON.parse(content);
      }

      const originalLength = config.plugins.length;
      config.plugins = config.plugins.filter(p => p.name !== pluginName);

      if (config.plugins.length === originalLength) {
        event.node.res.statusCode = 404;
        return { error: "Plugin not found" };
      }

      config.metadata = {
        lastUpdated: new Date().toISOString(),
        version: config.metadata?.version || "1.0.0"
      };

      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      return {
        success: true,
        message: "Plugin removed successfully"
      };
    } catch (error) {
      console.error("Error removing plugin:", error);
      event.node.res.statusCode = 500;
      return {
        success: false,
        error: `Failed to remove plugin: ${(error as Error).message}`,
      };
    }
  }

  // Method not allowed for any other HTTP method
  event.node.res.statusCode = 405;
  return { error: "Method not allowed" };
});