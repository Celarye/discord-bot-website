import { defineEventHandler } from 'h3';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import {process} from "std-env";

export default defineEventHandler(async (event) => {
    try {
        const logPath = path.resolve(process.cwd(), 'logs', 'bot.log');

        // if log file doesn't exist, return empty array
        if (!fs.existsSync(logPath)) {
            return { logs: [] };
        }

        // parse log level and limit from query parameters
        const query = getQuery(event);
        const level = query.level as string || 'all';
        const limit = parseInt(query.limit as string || '100');

        // read the log file from the end (most recent logs first)
        const logs = [];
        const fileStream = fs.createReadStream(logPath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        // parse log lines into structured format
        for await (const line of rl) {
            const match = line.match(/\[(.*?)\] (\w+): (.*)/);
            if (match) {
                const [, timestamp, logLevel, message] = match;

                // filter by log level if specified
                if (level !== 'all' && level !== logLevel.toLowerCase()) {
                    continue;
                }

                logs.push({
                    timestamp,
                    level: logLevel.toLowerCase(),
                    message
                });

                if (logs.length >= limit) {
                    break;
                }
            }
        }

        return { logs: logs.reverse() };
    } catch (error) {
        console.error('Error reading logs:', error);
        return {
            logs: [],
            error: `Failed to read logs: ${error.message}`
        };
    }
});

function getQuery(event) {
    const url = new URL(event.node.req.url, 'http://localhost');
    const query = {};
    for (const [key, value] of url.searchParams.entries()) {
        query[key] = value;
    }
    return query;
}