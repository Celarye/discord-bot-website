declare module "js-yaml" {
  // Define more specific types for the parameters and return types
  export function load(input: string, options?: LoadOptions): unknown;
  export function dump(object: unknown, options?: DumpOptions): string;

  // Define interfaces for the options
  interface LoadOptions {
    filename?: string;
    schema?: object;
    json?: boolean;
    [key: string]: unknown;
  }

  interface DumpOptions {
    indent?: number;
    noArrayIndent?: boolean;
    skipInvalid?: boolean;
    flowLevel?: number;
    styles?: Record<string, string>;
    schema?: object;
    [key: string]: unknown;
  }

  // Add other methods as needed
}
