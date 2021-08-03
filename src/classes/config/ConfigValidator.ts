import { ConfigValue } from './../../types';

class ConfigValidator {
  public static VALID_TYPES: string[] = [
    'boolean',
    'number',
    'string',
    'null'
  ];

  public types: Record<string, string | string[]>;

  constructor(types: Record<string, string | string[]>) {
    this.validateTypes(types);

    this.types = types;
  }

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

  public castFromString(config: Record<string, string>): Record<string, ConfigValue> {
    const castedConfig: Record<string, ConfigValue> = { ...config };

    Object.keys(config).forEach((key) => {
      const value = config[key];
      const type = this.types[key] || 'string';

      if (type === 'string' || type.includes('string')) {
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

  private isValueValid(value: ConfigValue, type: string): boolean {
    if (type === 'null') {
      return value === null;
    }

    return typeof value === type;
  }

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
