export interface Plugintype {
  name: string;
  version: string;
}

export interface AvailablePlugins {
  name: string;
  versions: string[];
  description: string;
}

export interface BotStatus {
  status: "running" | "stopped" | "unknown";
  pid?: number;
  error?: string;
}

export interface BotResponse {
  success: boolean;
  status: "running" | "stopped" | "unknown";
  pid?: number;
  message?: string;
}

export interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  message: string;
}

export interface LogsResponse {
  logs: LogEntry[];
  error?: string;
}
