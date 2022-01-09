import { ConfigValue } from '../../types';

/**
 * A validator class for the configuration provider. This class receives an object
 * with a subset of the keys of the config with a type or array of types corresponding
 * to that config value.
 *
 * Valid types include: `boolean`, `number`, `string` and `null`.
 * You can set a type to be an array containing multiple of the ones above.
 *
 * It is preferable to specify all the types for your config. However, if a type is omitted
 * it will be defaulted to `string`. Keep this in mind in the case you need to have
 * a boolean or a number in your configuration.
 *
 * This configuration is most useful for configuration coming from env variables
 * since they are only strings. Although, in a case where only a JSON configuration is
 * specified, you may run into trouble if you don't specify the types for those settings
 * because, while JSON properties can be typed, the validator will default them to `string`,
 * which will make the validation throw an error during the ConfigProvider creation.
 */
class ConfigValidator {
  /**
   * The valid types that can be used. It is also possible to have an array of these types.
   * @static
   * @type {string[]}
   * @memberof ConfigValidator
   */
  public static VALID_TYPES: string[] = [
    'boolean',
    'number',
    'string',
    'null'
  ];

  /**
   * The types for this config validator.
   * @type {(Record<string, string | string[]>)}
   * @memberof ConfigValidator
   */
  public types: Record<string, string | string[]>;

  /**
   * @param types The types for this config validator.
   */
  constructor(types: Record<string, string | string[]>) {
    this.validateTypes(types);

    this.types = types;
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
      const type = this.types[key] || 'string';

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
   * based on the types defined in this validator. If a cast is not possible, the value
   * will remain unchanged. This does not mutate the config object given and instead returns
   * a copy of it.
   * @param config The object of string values to be cast.
   * @returns An object with the values cast.
   */
  public castFromString(config: Record<string, string>): Record<string, ConfigValue> {
    const castedConfig: Record<string, ConfigValue> = { ...config };

    Object.keys(config).forEach((key) => {
      const value = config[key];
      const type = this.types[key] || 'string';

      if (type === 'string' || type.includes('string') && !type.includes('null')) {
        return;
      }

      if (Array.isArray(type)) {
        for (const t of type) {
          const casted = this.tryCastSingleValue(value, t);
          if (casted !== value) {
            castedConfig[key] = casted;
            break;
          }
        }

        return;
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

    return typeof value === type;
  }

  /**
   * Tries to cast a value into its type from string. It returns the same value
   * if the cast is not possible.
   * @param value The value to cast.
   * @param type The type to cast the value to.
   * @returns The cast value.
   * @throws Throws if the type is invalid.
   */
  private tryCastSingleValue(value: ConfigValue, type: string): ConfigValue {
    let casted: ConfigValue = value;

    switch (type) {
      case 'boolean':
        if (value === 'true') {
          casted = true;
        }

        if (value === 'false') {
          casted = false;
        }

        break;
      case 'number':
        casted = Number(value);

        if (isNaN(casted)) {
          casted = value;
        }

        break;

      case 'string':
        casted = `${value}`;
        break;

      case 'null':
        if (value === 'null') {
          casted = null;
        }

        break;
      default:
        throw new TypeError(`${type} is an invalid type. Must be or contain: ${ConfigValidator.VALID_TYPES.join(', ')}.`);
    }

    return casted;
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

export default ConfigValidator;
