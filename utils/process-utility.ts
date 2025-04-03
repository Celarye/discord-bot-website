/**
 * Utility functions for process management
 */
import { exec } from "child_process";
import process from "process";

/**
 * Get the current working directory
 * @returns The current working directory path
 */
export function getCwd(): string {
  return process.cwd();
}

/**
 * Send a signal to a process
 * @param pid - The process ID
 * @param signal - The signal to send (e.g., 'SIGTERM', 'SIGKILL', or 0 to check if process exists)
 */
export function killProcess(
  pid: number,
  signal: NodeJS.Signals | number,
): void {
  if (typeof signal === "number") {
    process.kill(pid, signal);
  } else {
    process.kill(pid, signal);
  }
}

/**
 * Execute a shell command
 * @param command - The command to execute
 * @returns Promise that resolves with the command output
 */
export function executeCommand(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout || stderr);
    });
  });
}
