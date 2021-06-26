/**
 * The config provider's options object. This defines where the config will be pulled from
 * and the default values for the config.
 */
interface ConfigProviderOptions {
  /**
   * The resolved path where the JSON config file is located.
   * This should resolve to the actual JSON file.
   */
  configPath?: string,

  /**
   * The environment variables object to be used.
   * This should generally be `process.env` unless your variables
   * are pre-processed.
   */
  env?: Record<string, string | boolean>,

  /**
   * The default config values in case they weren't provided
   * by any of the previously mentioned sources.
   */
  default?: Record<string, string | boolean>
}

export default ConfigProviderOptions;
