import { defineEventHandler, readBody } from 'h3';
import fs from 'fs';
import path from 'path';
import { process } from "std-env";

export default defineEventHandler(async (event) => {
    const method = event.node.req.method;

    // Path to the plugins.yaml file
    const configPath = path.resolve(process.cwd(), 'plugins', 'plugins.yaml');

    // GET request - return the current configuration
    if (method === 'GET') {
        try {
            if (fs.existsSync(configPath)) {
                const content = fs.readFileSync(configPath, 'utf8');
                return content;
            } else {
                // Return 404 if file doesn't exist
                event.node.res.statusCode = 404;
                return { error: 'Configuration file not found' };
            }
        } catch (error) {
            console.error('Error reading plugin configuration:', error);
            event.node.res.statusCode = 500;
            return { error: `Failed to read configuration: ${error.message}` };
        }
    }

    // POST request - save new configuration
    if (method === 'POST') {
        try {
            // Ensure the plugins directory exists
            const pluginsDir = path.dirname(configPath);
            if (!fs.existsSync(pluginsDir)) {
                fs.mkdirSync(pluginsDir, { recursive: true });
            }

            // Get the body content
            const body = await readBody(event);

            // Write the YAML content to the file
            fs.writeFileSync(configPath, body);

            // Log the action
            const logDir = path.resolve(process.cwd(), 'logs');
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
            }

            const timestamp = new Date().toISOString();
            const logEntry = `[${timestamp}] INFO: Plugin configuration updated\n`;
            fs.appendFileSync(path.join(logDir, 'bot.log'), logEntry);

            return { success: true, message: 'Configuration saved successfully' };
        } catch (error) {
            console.error('Error saving plugin configuration:', error);
            event.node.res.statusCode = 500;
            return {
                success: false,
                error: `Failed to save configuration: ${error.message}`
            };
        }
    }

    // Method not allowed for any other HTTP method
    event.node.res.statusCode = 405;
    return { error: 'Method not allowed' };
});