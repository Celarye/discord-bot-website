import fs from "fs";
import path from "path";
import { defineEventHandler, readBody } from "h3";

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;

  // path to the plugins.yaml file
  const configPath = path.resolve("plugins", "plugins.yaml");

  // GET request - return the current configuration
  if (method === "GET") {
    try {
      if (fs.existsSync(configPath)) {
        return fs.readFileSync(configPath, "utf8");
      } else {
        // return 404 if file doesn't exist
        event.node.res.statusCode = 404;
        return { error: "Configuration file not found" };
      }
    } catch (error) {
      console.error("Error reading plugin configuration:", error);
      vent.node.res.statusCode = 500;
      return {
        error: `Failed to read configuration: ${(error as Error).message}`,
      };
    }
  }

  // POST request - save new configuration
  if (method === "POST") {
    try {
      // ensure the plugins directory exists
      const pluginsDir = path.dirname(configPath);
      if (!fs.existsSync(pluginsDir)) {
        fs.mkdirSync(pluginsDir, { recursive: true });
      }

      // get the body content
      const body = await readBody(event);

      // write the YAML content to the file
      fs.writeFileSync(configPath, body);

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

  // method not allowed for any other HTTP method
  event.node.res.statusCode = 405;
  return { error: "Method not allowed" };
});
