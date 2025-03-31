import yaml from 'js-yaml';

export async function fetchAvailable() {
    try {
        const response = await fetch('/plugins/plugins.yaml');
        if (!response.ok) {
            throw new Error('available plugins YAML cannot by loaded');
        }

        const yamlText = await response.text();
        const doc = yaml.load(yamlText);

        console.log("start");
        console.log(doc);
        return doc;
    } catch (e) {
        console.error('Error loading YAML: ', e);
    }
}
