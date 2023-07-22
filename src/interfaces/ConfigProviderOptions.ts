import { ConfigCustomValidators, ConfigValue } from '../types';

/**
 * The config provider's options object. This defines where the config will be pulled from
 * and the default values for the config.
 */
export interface ConfigProviderOptions {
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
  env?: Record<string, string>,

  /**
   * The default config values in case they weren't provided
   * by any of the previously mentioned sources.
   */
  default?: Record<string, ConfigValue>

  /**
   * The types of each config for the validator to validate.
   * It can be a string or an array of strings.
   * Types can be: `boolean`, `number`, `string`, or `null`.
   */
  types?: Record<string, string | string[]>,

  /**
   * An object that maps a config key to a custom validator function.
   * This validator function will be used to validate the config supplied.
   * It will skip the default type validator and instead use the one specified here.
   * This function should not return anything, but throw a TypeError if the given value is not
   * correct.
   */
  customValidators?: ConfigCustomValidators
}
