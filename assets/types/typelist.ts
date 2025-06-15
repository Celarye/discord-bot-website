import type { DateValue } from "@internationalized/date";

export interface Plugintype {
  name: string;
  version: string;
}

export interface AvailablePlugins {
  name: string;
  versions: string[];
  description: string;
}

export interface FilterValues {
  searchQuery?: string;
  logLevels: {
    error: boolean;
    warning: boolean;
    info: boolean;
  };
  date?: DateValue | undefined;
}

export interface Log {
  id: string;
  type: "info" | "warning" | "error";
  message: string;
  timestamp: string;
}
