export interface Plugintype {
  name: string;
  version: string;
  enabled?: boolean;
}

export interface AvailablePlugins {
  name: string;
  versions: string[];
  description: string;
}
