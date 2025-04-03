import yaml from "js-yaml";
import type { BotResponse, BotStatus, LogEntry } from "../types/typelist";

export async function fetchAvailable() {
  try {
    const response = await fetch("/plugins.yaml");

    if (!response.ok) {
      throw new Error("Available plugins YAML cannot be loaded");
    }

    const yamlText = await response.text();
    const doc = yaml.load(yamlText);

    return doc;
  } catch (e) {
    console.error("Error loading YAML: ", (e as Error).message);
    throw e;
  }
}

export async function fetchPlugins() {
  try {
    const response = await fetch("/plugins.yaml");

    if (!response.ok) {
      throw new Error("Available plugins YAML cannot be loaded");
    }

    const yamlText = await response.text();
    const doc = yaml.load(yamlText);

    return doc;
  } catch (e) {
    console.error("Error loading YAML: ", (e as Error).message);
    throw e;
  }
}

export async function getBotStatus(): Promise<BotStatus> {
  try {
    const response = await fetch("/api/bot/status");

    if (!response.ok) {
      throw new Error("Failed to fetch bot status");
    }

    return await response.json();
  } catch (e) {
    console.error("Error fetching bot status: ", (e as Error).message);
    return { status: "unknown", error: (e as Error).message };
  }
}

export async function startBot(): Promise<BotResponse> {
  try {
    const response = await fetch("/api/bot/start", {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Failed to start bot");
    }

    return await response.json();
  } catch (e) {
    console.error("Error starting bot: ", (e as Error).message);
    return {
      success: false,
      status: "unknown",
      message: (e as Error).message,
    };
  }
}

export async function stopBot(): Promise<BotResponse> {
  try {
    const response = await fetch("/api/bot/stop", {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Failed to stop bot");
    }

    return await response.json();
  } catch (e) {
    console.error("Error stopping bot: ", (e as Error).message);
    return {
      success: false,
      status: "unknown",
      message: (e as Error).message,
    };
  }
}

export async function fetchLogs(
  level: string = "all",
  limit: number = 100,
): Promise<LogEntry[]> {
  try {
    const response = await fetch(`/api/logs?level=${level}&limit=${limit}`);

    if (!response.ok) {
      throw new Error("Failed to fetch logs");
    }

    const data = await response.json();
    return data.logs || [];
  } catch (e) {
    console.error("Error fetching logs: ", e);
    return [];
  }
}
