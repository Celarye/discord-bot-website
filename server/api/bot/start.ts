import { defineEventHandler } from 'h3';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import {process} from "std-env";

export default defineEventHandler(async () => {
    try {
        // check if bot is running
        const pidPath = path.resolve(process.cwd(), 'bot.pid');

        if (fs.existsSync(pidPath)) {
            const pid = parseInt(fs.readFileSync(pidPath, 'utf-8'));
            try {
                // if process exists, bot is already running
                process.kill(pid, 0);
                return {
                    success: false,
                    status: 'running',
                    message: 'Bot is already running'
                };
            } catch (err) {
                // PID file exists process doesn't - clean up
                fs.unlinkSync(pidPath);
            }
        }

        // start bot process
        const botProcess = spawn('node', ['./bot/index.js'], {
            detached: true,
            stdio: 'ignore'
        });

        // store PID
        fs.writeFileSync(pidPath, botProcess.pid.toString());

        // log the start
        const logDir = path.resolve(process.cwd(), 'logs');
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }

        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] INFO: Bot process started with PID: ${botProcess.pid}\n`;
        fs.appendFileSync(path.join(logDir, 'bot.log'), logEntry);

        // detach the process so it continues running after request ends
        botProcess.unref();

        return {
            success: true,
            status: 'running',
            pid: botProcess.pid
        };
    } catch (error) {
        console.error('Error starting bot:', error);
        return {
            success: false,
            status: 'stopped',
            message: `Failed to start bot: ${error.message}`
        };
    }
});