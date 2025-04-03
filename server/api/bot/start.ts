import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { getCwd, killProcess } from "~/utils/process-utility";
import { defineEventHandler } from "h3";

export default defineEventHandler(async () => {
  try {
    // check if bot is running
    const pidPath = path.resolve(getCwd(), "bot.pid");

    if (fs.existsSync(pidPath)) {
      const pid = parseInt(fs.readFileSync(pidPath, "utf-8"));
      try {
        // if process exists, bot is already running
        killProcess(pid, 0);
        return {
          success: false,
          status: "running",
          message: "Bot is already running",
        };
      } catch (err) {
        console.error("PID file exists but process doesn't. Cleaning up.", err);
        // PID file exists process doesn't - clean up
        fs.unlinkSync(pidPath);
      }
    }

    // start bot process
    const botProcess = spawn("node", ["./bot/index.js"], {
      detached: true,
      stdio: "ignore",
    });

    // Check if pid is defined
    if (botProcess.pid === undefined) {
      throw new Error("Failed to start bot: Process PID is undefined");
    }

    // store PID
    fs.writeFileSync(pidPath, botProcess.pid.toString());

    // log the start
    const logDir = path.resolve(getCwd(), "logs");
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] INFO: Bot process started with PID: ${botProcess.pid}\n`;
    fs.appendFileSync(path.join(logDir, "bot.log"), logEntry);

    // detach the process so it continues running after request ends
    botProcess.unref();

    return {
      success: true,
      status: "running",
      pid: botProcess.pid,
    };
  } catch (error: unknown) {
    console.error("Error starting bot:", error);
    return {
      success: false,
      status: "stopped",
      message: `Failed to start bot: ${(error as Error).message}`,
    };
  }
});
