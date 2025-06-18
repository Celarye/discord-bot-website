// server/api/bot/start.post.ts
import { spawn } from "child_process";
import path from "path";

export default defineEventHandler(async () => {
  try {
    // Spawn the Discord bot executable
    const botPath = path.join(process.cwd(), "discord-bot.exe");
    const botProcess = spawn(botPath, [], {
      detached: true,
      stdio: "ignore",
    });

    botProcess.unref(); // Allow the parent process to exit independently

    return {
      success: true,
      message: "Bot started successfully",
      pid: botProcess.pid,
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to start bot",
      data: error,
    });
  }
});
