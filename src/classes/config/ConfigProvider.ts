import fs from 'fs';
import ConfigProviderOptions from '../../interfaces/ConfigProviderOptions';
import ConfigValidator from './ConfigValidator';
import { ConfigValue } from '../../types';

/**
 * A client configuration provider. It accepts configuration from both ENV variables and JSON config file.
 * Should be created before initializing client.
 *
 * + Environment variables should be prepended with `DISCORD_` all upper-cased.
 * + JSON config properties should be [snake_cased](https://en.wikipedia.org/wiki/Snake_case).
 * + You may also specify default values, for which they need to be upper-cased as well.
 *
 * If multiple sources are specified, the configuration will be processed in the following order:
 *
 * 1. The default values.
 * 2. The JSON config file.
 * 3. The environment variables.
 *
 * > If config is repeated on multiple sources, they'll be overwritten by the latest config source.
 *
 * An example environment variable file would be:
 *
 * ```text
 * DISCORD_TOKEN=MY_TOKEN
 * DISCORD_MY_VARIABLE=$
 * ```
 *
 * An example JSON config file would be:
 *
 * ```json
 * {
 *   "token": "MY_TOKEN",
 *   "my_variable": "$"
 * }
 * ```
 *
 * An example default object would be:
 *
 * ```js
 * {
 *   TOKEN: 'MY_TOKEN',
 *   MY_VARIABLE: '$'
 * }
 * ```
 *
 * Getting values from this config would be done by:
 *
 * ```js
 * const token = client.config.get('TOKEN');
 * const myVariable = client.config.get('MY_VARIABLE');
 * ```
 *
 * It is also recommended specifying the types of the config. Check {@link ConfigValidator} for more information.
 */
class ConfigProvider {
  /**
   * The options for this config provider.
   * @type {ConfigProviderOptions}
   * @memberof ConfigProvider
   */
  public readonly options: ConfigProviderOptions;

  /**
   * The default config values.
   * @type {(Record<string, ConfigValue>)}
   * @memberof ConfigProvider
   */
  public readonly default?: Record<string, ConfigValue>;

  /**
   * The processed config object.
   * @type {(Record<string, ConfigValue>)}
   * @memberof ConfigProvider
   */
  public readonly config: Record<string, ConfigValue>;

  /**
   * The validator for this config.
   * @type {ConfigValidator}
   * @memberof ConfigProvider
   */
  public readonly validator: ConfigValidator;

  /**
   * @param options The options for this config provider.
   */
  constructor(options: ConfigProviderOptions = {}) {
    this.options = options;
    this.default = options.default;
    this.config = {};
    this.validator = new ConfigValidator(options.types || {});

    this.processDefaults(options.default);
    this.processConfigFile(options.configPath);
    this.processEnv(options.env);

    this.validator.validate(this.config);
  }

  /**
   * Get the value corresponding to the provided key.
   * @param key The key of the configuration. Keys are upper-cased.
   * @returns The corresponding value.
   */
  public get(key: string): ConfigValue | undefined {
    return this.config[key];
  }

  /**
   * Process the default configuration.
   * @param defaults The defaults object.
   */
  private processDefaults(defaults?: Record<string, ConfigValue>): void {
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
   * Process the environment variables object for configuration.
   * Keys must begin with DISCORD_ to be added to the configuration provider.
   * @param env The environment variables object.
   */
  private processEnv(env?: Record<string, ConfigValue>): void {
    if (!env) {
      return;
    }

    const configFromEnv = Object.keys(env)
      .filter((key) => key.startsWith('DISCORD_'))
      .reduce((obj, key) => {
        return { ...obj, [key.substring('DISCORD_'.length)]: env[key] };
      }, {});

    const castedConfig = this.validator.castFromString(configFromEnv);

    for (const key in castedConfig) {
      this.config[key] = castedConfig[key];
    }
  }
}

export default ConfigProvider;
