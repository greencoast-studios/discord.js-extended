import fs from 'fs';
import ConfigProviderOptions from '../../interfaces/ConfigProviderOptions';

/**
 * A client configuration provider. It accepts configuration from both ENV variables and JSON config file. Should be created before initializing client.
 */
class ConfigProvider {
  public readonly options: ConfigProviderOptions;
  public readonly default?: Record<string, string | boolean>;
  public readonly config: Record<string, string | boolean>;

  /**
   * @param options The configuration options.
   */
  constructor(options: ConfigProviderOptions = {}) {
    this.options = options;
    this.default = options.default;
    this.config = {};

    this.processDefaults(options.default);
    this.processConfigFile(options.configPath);
    this.processEnv(options.env);
  }

  /**
   * Get the value corresponding to the provided key.
   * @param key The key of the configuration. Keys are upper cased.
   * @returns The corresponding value.
   */
  public get(key: string): string | boolean | undefined {
    return this.config[key];
  }

  /**
   * Process the default configuration.
   * @param defaults The defaults object.
   */
  private processDefaults(defaults?: Record<string, string | boolean>): void {
    if (!defaults) {
      return;
    }

    for (const key in defaults) {
      this.config[key] = defaults[key];
    }
  }

  /**
   * Process the configuration provided by the specified JSON file.
   * @param configPath The path where the JSON configuration file is located.
   */
  private processConfigFile(configPath?: string): void {
    if (!configPath || !fs.existsSync(configPath)) {
      return;
    }

    const json = JSON.parse(fs.readFileSync(configPath).toString());

    for (const key in json) {
      this.config[key.toUpperCase()] = json[key];
    }
  }

  /**
   * Process the environment variables object for configuration. Keys must begin with DISCORD_ to be added to the configuration provider.
   * @param env The environment variables object.
   */
  private processEnv(env?: Record<string, string | boolean>): void {
    if (!env) {
      return;
    }

    const discordKeys = Object.keys(env).filter((key) => key.startsWith('DISCORD_'));

    for (const key of discordKeys) {
      let value: string | boolean = env[key];

      if (value === 'true') {
        value = true;
      } else if (value === 'false') {
        value = false;
      }

      this.config[key.substring('DISCORD_'.length)] = value;
    }
  }
}

export default ConfigProvider;
