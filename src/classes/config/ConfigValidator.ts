import { ConfigValue, ConfigCustomValidators } from '../../types';

/**
 * A validator class for the configuration provider. This class receives an object
 * with a subset of the keys of the config with a type or array of types corresponding
 * to that config value.
 *
 * Valid types include: `boolean`, `number`, `string` and `null`,
 * or including their array types: `boolean[]`, `number[]` and `string[]`
 * You can set a type to be an array containing multiple of the ones above.
 *
 * It is preferable to specify all the types for your config. However, if a type is omitted
 * it will be defaulted to `string`. Keep this in mind in the case you need to have
 * a boolean or a number in your configuration.
 *
 * You may also specify custom validators by passing an object that maps the key of the config
 * with its validator. This validator function does not need to return anything, but throw a
 * TypeError if the given value in its parameter is not valid according to your criteria.
 * If you pass a customValidator for a specific key, you should still pass its type because
 * it is used to cast the value coming from environment variables, since they're only strings.
 *
 * This configuration is most useful for configuration coming from env variables
 * since they are only strings. Although, in a case where only a JSON configuration is
 * specified, you may run into trouble if you don't specify the types for those settings
 * because, while JSON properties can be typed, the validator will default them to `string`,
 * which will make the validation throw an error during the ConfigProvider creation.
 */
export class ConfigValidator {
  /**
   * The valid types that can be used. It is also possible to have an array of these types.
   * @static
   * @type {string[]}
   * @memberof ConfigValidator
   */
  public static readonly VALID_TYPES: string[] = [
    'boolean',
    'number',
    'string',
    'null',
    'boolean[]',
    'number[]',
    'string[]'
  ];

  /**
   * The types for this config validator.
   * @type {(Record<string, string | string[]>)}
   * @memberof ConfigValidator
   */
  private readonly types: Record<string, string | string[]>;

  /**
   * An object that maps a config key to a custom validator function.
   * This validator function will be used to validate the config supplied.
   * It will skip the default type validator and instead use the one specified here.
   * This function should not return anything, but throw a TypeError if the given value is not
   * correct.
   * @type {ConfigCustomValidators}
   * @memberof ConfigValidator
   */
  private readonly customValidators: ConfigCustomValidators;

  /**
   * @param types The types for this config validator.
   * @param customValidators An object that maps a config key to a custom validator function.
   */
  public constructor(types: Record<string, string | string[]>, customValidators: ConfigCustomValidators = {}) {
    this.validateTypes(types);

    this.types = types;
    this.customValidators = customValidators;
  }

  /**
   * Validate that the provided config complies with all the types defined
   * in this validator.
   * @param config The configuration object to test.
   * @throws Throws if the config contains a value that does not have a correct type.
   */
  public validate(config: Record<string, ConfigValue>): void {
    Object.keys(config).forEach((key) => {
      const value = config[key];

      const customValidator = this.customValidators[key];
      if (customValidator) {
        return customValidator(value);
      }

      const type = this.types[key];
      if (!type) {
        return;
      }

      if (Array.isArray(type)) {
        const valid = type.some((t) => {
          return this.isValueValid(value, t);
        });

        if (!valid) {
          throw new TypeError(`${value} in config for key ${key} does not conform to types ${type.join(', ')}.`);
        }

        return;
      }

      if (!this.isValueValid(value, type)) {
        throw new TypeError(`${value} in config for key ${key} does not conform to type ${type}.`);
      }
    });
  }

  /**
   * Casts the values in an object of string values into its corresponding types
   * based on the types defined in this validator. If a cast is not possible, the function will throw.
   * This does not mutate the config object given and instead returns a copy of it with the cast config values.
   * If the type includes `string` then this function will try to cast first to any of the available types and
   * if it fails to cast to any of them, it will return the `string` version of the value instead of throwing.
   * @param config The object of string values to be cast.
   * @returns An object with the values cast.
   * @throws Throws if a config value cannot be cast to any of its specified types.
   */
  public castFromString(config: Record<string, string>): Record<string, ConfigValue> {
    const castedConfig: Record<string, ConfigValue> = { ...config };

    Object.keys(config).forEach((key) => {
      const value = config[key];
      const type = this.types[key] || 'string';

      if (Array.isArray(type)) {
        let containsString = false;

        for (const t of type) {
          try {
            if (t === 'string') {
              containsString = true;
              continue;
            }

            castedConfig[key] = this.tryCastSingleValue(value, t);
            return;
          } catch (_) {
            continue;
          }
        }

        if (containsString) {
          castedConfig[key] = this.tryCastSingleValue(value, 'string');
          return;
        }

        throw new TypeError(`${value} cannot be cast to any of ${type.join(', ')}`);
      }

      castedConfig[key] = this.tryCastSingleValue(value, type);
    });

    return castedConfig;
  }

  /**
   * Returns `true` if the value given conforms the type given.
   * @param value The value to test.
   * @param type The type to test.
   * @returns Whether the value's type is valid.
   */
  private isValueValid(value: ConfigValue, type: string): boolean {
    if (type === 'null') {
      return value === null;
    }

    if (type.endsWith('[]')) {
      if (Array.isArray(value)) {
        const singleType = type.slice(0, type.length - 2);
        const valueArray = value as ConfigValue[];

        return valueArray.every((val: ConfigValue) => typeof val === singleType);
      }

      return false; // It should be an array.
    }

    return typeof value === type;
  }

  /**
   * Tries to cast a value into its type from string. It returns the same value
   * if the cast is not possible.
   * @param value The value to cast.
   * @param type The type to cast the value to.
   * @returns The cast value.
   * @throws Throws if the type is invalid.
   * @throws Throws if the value cannot be cast to its specified type.
   */
  private tryCastSingleValue(value: string, type: string): ConfigValue {
    let casted: ConfigValue;

    switch (type) {
      case 'boolean':
        if (value === 'true') {
          return true;
        }

        if (value === 'false') {
          return false;
        }

        throw new TypeError(`Cannot cast ${value} to boolean!`);
      case 'number':
        casted = Number(value);

        if (isNaN(casted)) {
          throw new TypeError(`Cannot cast ${value} to number!`);
        }

        return casted;
      case 'string':
        return `${value}`;

      case 'string[]':
        return value.split(',').map((v) => this.tryCastSingleValue(v, 'string') as string);

      case 'boolean[]':
        return value.split(',').map((v) => this.tryCastSingleValue(v, 'boolean') as boolean);

      case 'number[]':
        return value.split(',').map((v) => this.tryCastSingleValue(v, 'number') as number);

      case 'null':
        if (value === 'null') {
          return null;
        }

        throw new TypeError(`Cannot cast ${value} to null!`);
      default:
        throw new TypeError(`${type} is an invalid type. Must be or contain: ${ConfigValidator.VALID_TYPES.join(', ')}.`);
    }
  }

  /**
   * Tests that all the types are correct and valid.
   * @param types The types to test.
   * @throws Throws if any of the types specified is invalid.
   */
  private validateTypes(types: Record<string, string | string[]>): void {
    Object.keys(types).forEach((key) => {
      const type = types[key];

      if (Array.isArray(type)) {
        type.forEach((t) => {
          if (!ConfigValidator.VALID_TYPES.includes(t)) {
            throw new TypeError(`${type.join(', ')} is an invalid type. Must be or contain: ${ConfigValidator.VALID_TYPES.join(', ')}.`);
          }
        });

        return;
      }

      if (!ConfigValidator.VALID_TYPES.includes(type)) {
        throw new TypeError(`${type} is an invalid type. Must be or contain: ${ConfigValidator.VALID_TYPES.join(', ')}.`);
      }
    });
  }
}
