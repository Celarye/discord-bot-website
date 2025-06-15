export interface Plugintype {
  name: string;
  version: string;
}

export interface AvailablePlugins {
  name: string;
  versions: string[];
  description: string;
}

export interface Log{
  id: string;
  type: "info" | "warning" | "error";
  message: string;
  timestamp: string;
}
