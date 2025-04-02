import { defineEventHandler } from 'h3';
import fs from 'fs';
import path from 'path';
import {process} from "std-env";

export default defineEventHandler(async () => {
    try {
        const pidPath = path.resolve(process.cwd(), 'bot.pid');

        if (!fs.existsSync(pidPath)) {
            return {
                success: false,
                status: 'stopped',
                message: 'Bot is not running'
            };
        }

        const pid = parseInt(fs.readFileSync(pidPath, 'utf-8'));

        try {
            // check if process exists
            process.kill(pid, 0);

            // send SIGTERM to stop the process gracefully
            process.kill(pid, 'SIGTERM');

            // log the stop
            const logDir = path.resolve(process.cwd(), 'logs');
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
            }

            const timestamp = new Date().toISOString();
            const logEntry = `[${timestamp}] INFO: Bot process with PID ${pid} was stopped\n`;
            fs.appendFileSync(path.join(logDir, 'bot.log'), logEntry);

            // remove PID file
            fs.unlinkSync(pidPath);

            return {
                success: true,
                status: 'stopped'
            };
        } catch (err) {
            // process doesn't exist, clean up PID file
            fs.unlinkSync(pidPath);
            return {
                success: true,
                status: 'stopped',
                message: 'Bot was not running, cleaned up stale PID file'
            };
        }
    } catch (error) {
        console.error('Error stopping bot:', error);
        return {
            success: false,
            status: 'unknown',
            message: `Failed to stop bot: ${error.message}`
        };
    }
});