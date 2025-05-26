import yaml from "js-yaml";

export async function fetchAvailable() {
  try {
    const response = await fetch("/plugins.yaml");

    if (!response.ok) {
      new Error("Available plugins YAML cannot be loaded");
    }

    const yamlText = await response.text();
    return yaml.load(yamlText);
  } catch (e) {
    console.error("Error loading YAML: ", (e as Error).message);
    throw e;
  }
}
