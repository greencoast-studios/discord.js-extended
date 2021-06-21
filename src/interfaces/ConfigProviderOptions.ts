interface ConfigProviderOptions {
  configPath?: string,
  env?: Record<string, string | boolean>,
  default?: Record<string, string | boolean>
}

export default ConfigProviderOptions;
