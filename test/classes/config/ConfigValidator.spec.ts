import ConfigValidator from '../../../src/classes/config/ConfigValidator';

const mockedConfig = {
  TOKEN: '123123123',
  NUM: 123,
  F: false,
  F_STRING: 'false',
  NULLABLE: 'optional',
  STR_ARRAY: ['hi', 'there'],
  BOOL_ARRAY: [true, false],
  NUM_ARRAY: [3.14, 42],
  STR_MUL_SINGLE: ['string here']
};

const mockedTypes = {
  TOKEN: 'string',
  NUM: 'number',
  F: 'boolean',
  F_STRING: ['string', 'boolean'],
  NULLABLE: ['string', 'null'],
  STR_ARRAY: 'string[]',
  BOOL_ARRAY: 'boolean[]',
  NUM_ARRAY: 'number[]',
  STR_MUL_SINGLE: ['string', 'string[]']
};

describe('Classes: Config: ConfigValidator', () => {
  let validator: ConfigValidator;

  beforeEach(() => {
    validator = new ConfigValidator(mockedTypes);
  });

  describe('constructor', () => {
    it('should throw if a type is invalid.', () => {
      expect(() => {
        return new ConfigValidator({ INVALID: 'hello' });
      }).toThrow();
    });

    it('should throw if a type includes an invalid type.', () => {
      expect(() => {
        return new ConfigValidator({ SEMI_INVALID: ['string', 'hello'] });
      }).toThrow();
    });
  });

  describe('validate()', () => {
    it('should not throw if values are valid.', () => {
      expect(() => {
        validator.validate(mockedConfig);
      }).not.toThrow();
    });

    it('should throw if a value does not conform with its type.', () => {
      expect(() => {
        validator.validate({ TOKEN: false });
      }).toThrow();
    });

    it('should throw if a value does not conform with multiple types.', () => {
      expect(() => {
        validator.validate({ F_STRING: 123 });
      }).toThrow();
    });

    it('should not throw if config contains extraneous keys of any type.', () => {
      expect(() => {
        validator.validate({ EXTRA: '123' });
      }).not.toThrow();
      expect(() => {
        validator.validate({ EXTRA: 123 });
      }).not.toThrow();
      expect(() => {
        validator.validate({ EXTRA: false });
      }).not.toThrow();
    });

    it('should throw if non nullable config is null.', () => {
      expect(() => {
        validator.validate({ F: null });
      }).toThrow();
    });

    it('should not throw if nullable config is null.', () => {
      expect(() => {
        validator.validate({ NULLABLE: null });
      }).not.toThrow();
    });

    it('should throw if value does not conform custom validator.', () => {
      validator = new ConfigValidator({ CUSTOM: 'string' }, {
        CUSTOM: (value) => {
          if (value !== 'my_enum') {
            throw new TypeError('Invalid value for key CUSTOM');
          }
        }
      });

      expect(() => {
        validator.validate({ CUSTOM: 'invalid' });
      }).toThrow(TypeError);
    });

    it('should not throw if value does conform custom validator.', () => {
      validator = new ConfigValidator({ CUSTOM: 'string' }, {
        CUSTOM: (value) => {
          if (value !== 'my_enum') {
            throw new TypeError('Invalid value for key CUSTOM');
          }
        }
      });

      expect(() => {
        validator.validate({ CUSTOM: 'my_enum' });
      }).not.toThrow(TypeError);
    });
  });

  describe('castFromString()', () => {
    describe('With no type', () => {
      it('should keep the value as a string.', () => {
        const validator = new ConfigValidator({});

        const casted = validator.castFromString({ S: '123' });
        expect(typeof casted.S).toBe('string');
        expect(casted.S).toBe('123');
      });
    });

    describe('With "string"', () => {
      it('should keep the value as a string if type is string.', () => {
        const validator = new ConfigValidator({ S: 'string' });

        const casted = validator.castFromString({ S: '123' });
        expect(typeof casted.S).toBe('string');
        expect(casted.S).toBe('123');
      });

      it('should cast to null if the value is null and the type contains string and null.', () => {
        const validator1 = new ConfigValidator({ N: ['string', 'null'] });
        const validator2 = new ConfigValidator({ N: ['null', 'string'] });

        const casted1 = validator1.castFromString({ N: 'null' });
        const casted2 = validator2.castFromString({ N: 'null' });

        expect(casted1.N).toBeNull();
        expect(casted2.N).toBeNull();
      });

      it('should cast to boolean if it is a valid boolean string and the type contains boolean.', () => {
        const validator1 = new ConfigValidator({ B: ['string', 'boolean'] });
        const validator2 = new ConfigValidator({ B: ['boolean', 'string'] });

        const casted1 = validator1.castFromString({ B: 'true' });
        const casted2 = validator2.castFromString({ B: 'false' });

        expect(casted1.B).toBe(true);
        expect(casted2.B).toBe(false);
      });

      it('should return the value if it is an invalid boolean string and the type contains boolean.', () => {
        const validator1 = new ConfigValidator({ B: ['string', 'boolean'] });
        const validator2 = new ConfigValidator({ B: ['boolean', 'string'] });

        const casted1 = validator1.castFromString({ B: 'truthy' });
        const casted2 = validator2.castFromString({ B: 'truthy' });

        expect(casted1.B).toBe('truthy');
        expect(casted2.B).toBe('truthy');
      });

      it('should return the value if it is an invalid number string and the type contains number.', () => {
        const validator1 = new ConfigValidator({ N: ['string', 'number'] });
        const validator2 = new ConfigValidator({ N: ['number', 'string'] });

        const casted1 = validator1.castFromString({ N: '123.213.21' });
        const casted2 = validator2.castFromString({ N: '123.213.21' });

        expect(casted1.N).toBe('123.213.21');
        expect(casted2.N).toBe('123.213.21');
      });

      it('should cast to number if it is a valid number string and the type contains number.', () => {
        const validator1 = new ConfigValidator({ N: ['string', 'number'] });
        const validator2 = new ConfigValidator({ N: ['number', 'string'] });

        const casted1 = validator1.castFromString({ N: '3.14' });
        const casted2 = validator2.castFromString({ N: '42' });

        expect(casted1.N).toBe(3.14);
        expect(casted2.N).toBe(42);
      });

      it('should return the value if it is an invalid number[] string and the type contains number[].', () => {
        const validator1 = new ConfigValidator({ N: ['string', 'number[]'] });
        const validator2 = new ConfigValidator({ N: ['number[]', 'string'] });

        const casted1 = validator1.castFromString({ N: '123.213.21,23,23' });
        const casted2 = validator2.castFromString({ N: '123.213.21,23,23' });

        expect(casted1.N).toBe('123.213.21,23,23');
        expect(casted2.N).toBe('123.213.21,23,23');
      });

      it('should cast to number[] if it is a valid number[] string and the type contains number[].', () => {
        const validator1 = new ConfigValidator({ N: ['string', 'number[]'] });
        const validator2 = new ConfigValidator({ N: ['number[]', 'string'] });

        const casted1 = validator1.castFromString({ N: '3.14,42,1' });
        const casted2 = validator2.castFromString({ N: '3.14,42,1' });

        expect(casted1.N as number[]).toStrictEqual([3.14, 42, 1]);
        expect(casted2.N as number[]).toStrictEqual([3.14, 42, 1]);
      });

      it('should return the value if it is an invalid boolean[] string and the type contains boolean[].', () => {
        const validator1 = new ConfigValidator({ B: ['string', 'boolean[]'] });
        const validator2 = new ConfigValidator({ B: ['boolean[]', 'string'] });

        const casted1 = validator1.castFromString({ B: 'true,false,truthy' });
        const casted2 = validator2.castFromString({ B: 'true,false,truthy' });

        expect(casted1.B).toBe('true,false,truthy');
        expect(casted2.B).toBe('true,false,truthy');
      });

      it('should cast to boolean[] if it is a valid boolean[] string and the type contains boolean[].', () => {
        const validator1 = new ConfigValidator({ B: ['string', 'boolean[]'] });
        const validator2 = new ConfigValidator({ B: ['boolean[]', 'string'] });

        const casted1 = validator1.castFromString({ B: 'true,false,true' });
        const casted2 = validator2.castFromString({ B: 'true,false,true' });

        expect(casted1.B as boolean[]).toStrictEqual([true, false, true]);
        expect(casted2.B as boolean[]).toStrictEqual([true, false, true]);
      });
    });

    describe('With "string[]"', () => {
      it('should cast every item into a string.', () => {
        const validator = new ConfigValidator({ S: 'string[]' });

        const casted = validator.castFromString({ S: 'one,two,three' });

        expect(casted.S).toStrictEqual(['one', 'two', 'three']);
      });
    });

    describe('With "boolean"', () => {
      it('should cast the value to a boolean if it is a valid boolean string.', () => {
        const validator = new ConfigValidator({ T: 'boolean', F: 'boolean' });

        const casted = validator.castFromString({ T: 'true', F: 'false' });
        expect(typeof casted.T).toBe('boolean');
        expect(casted.T).toBe(true);
        expect(typeof casted.F).toBe('boolean');
        expect(casted.F).toBe(false);
      });

      it('should throw if it is not a valid boolean string.', () => {
        const validator = new ConfigValidator({ B: 'boolean' });

        expect(() => {
          validator.castFromString({ B: 'truthy' });
        }).toThrow();
      });

      it('should cast the value to a boolean if the type contains boolean and it is a valid boolean string.', () => {
        const validator1 = new ConfigValidator({ B: ['boolean', 'number'] });
        const validator2 = new ConfigValidator({ B: ['number', 'boolean'] });

        const casted1 = validator1.castFromString({ B: 'true' });
        expect(typeof casted1.B).toBe('boolean');
        expect(casted1.B).toBe(true);

        const casted2 = validator2.castFromString({ B: 'true' });
        expect(typeof casted2.B).toBe('boolean');
        expect(casted2.B).toBe(true);
      });

      it('should throw if the type contains boolean and it is not a valid boolean string.', () => {
        const validator1 = new ConfigValidator({ B: ['boolean', 'number'] });
        const validator2 = new ConfigValidator({ B: ['number', 'boolean'] });

        expect(() => {
          validator1.castFromString({ B: 'truthy' });
        }).toThrow();

        expect(() => {
          validator2.castFromString({ B: 'truthy' });
        }).toThrow();
      });
    });

    describe('With "boolean[]"', () => {
      it('should cast every item into a boolean.', () => {
        const validator = new ConfigValidator({ B: 'boolean[]' });

        const casted = validator.castFromString({ B: 'true,false,true' });

        expect(casted.B).toStrictEqual([true, false, true]);
      });

      it('should throw if any of the items is not a valid boolean string.', () => {
        const validator = new ConfigValidator({ B: 'boolean[]' });

        expect(() => {
          validator.castFromString({ B: 'true,false,truthy' });
        }).toThrow();
      });
    });

    describe('With "number"', () => {
      it('should cast the value to a number if it is a valid number string.', () => {
        const validator = new ConfigValidator({ N: 'number', F: 'number' });

        const casted = validator.castFromString({ N: '42', F: '3.1415' });
        expect(typeof casted.N).toBe('number');
        expect(casted.N).toBe(42);
        expect(typeof casted.F).toBe('number');
        expect(casted.F).toBe(3.1415);
      });

      it('should throw if it is not a valid number string.', () => {
        const validator = new ConfigValidator({ N: 'number' });

        expect(() => {
          validator.castFromString({ N: 'not-a-number' });
        }).toThrow();
      });

      it('should cast the value to a number if the type contains number and it is a valid number string.', () => {
        const validator1 = new ConfigValidator({ N: ['boolean', 'number'] });
        const validator2 = new ConfigValidator({ N: ['number', 'boolean'] });

        const casted1 = validator1.castFromString({ N: '42' });
        expect(typeof casted1.N).toBe('number');
        expect(casted1.N).toBe(42);

        const casted2 = validator2.castFromString({ N: '42' });
        expect(typeof casted2.N).toBe('number');
        expect(casted2.N).toBe(42);
      });

      it('should throw if the type contains number and it is not a valid number string.', () => {
        const validator1 = new ConfigValidator({ N: ['boolean', 'number'] });
        const validator2 = new ConfigValidator({ N: ['number', 'boolean'] });

        expect(() => {
          validator1.castFromString({ N: 'not-a-number' });
        }).toThrow();

        expect(() => {
          validator2.castFromString({ N: 'not-a-number' });
        }).toThrow();
      });
    });

    describe('With "number[]"', () => {
      it('should cast every item into a number.', () => {
        const validator = new ConfigValidator({ N: 'number[]' });

        const casted = validator.castFromString({ N: '1,2,3' });

        expect(casted.N).toStrictEqual([1, 2, 3]);
      });

      it('should throw if any of the items is not a valid number string.', () => {
        const validator = new ConfigValidator({ N: 'number[]' });

        expect(() => {
          validator.castFromString({ N: '123,223,11.123.1213' });
        }).toThrow();
      });
    });

    describe('With "null"', () => {
      it('should cast the value to a null if it is a valid null string.', () => {
        const validator = new ConfigValidator({ N: 'null' });

        const casted = validator.castFromString({ N: 'null' });
        expect(casted.N).toBeNull();
      });

      it('should throw if it is not a valid null string.', () => {
        const validator = new ConfigValidator({ N: 'null' });

        expect(() => {
          validator.castFromString({ N: 'not-null' });
        }).toThrow();
      });

      it('should cast the value to a null if the type contains null and it is a valid null string.', () => {
        const validator1 = new ConfigValidator({ N: ['null', 'number'] });
        const validator2 = new ConfigValidator({ N: ['number', 'null'] });

        const casted1 = validator1.castFromString({ N: 'null' });
        expect(casted1.N).toBeNull();

        const casted2 = validator2.castFromString({ N: 'null' });
        expect(casted2.N).toBeNull();
      });

      it('should throw if the type contains null and it is not a valid null string.', () => {
        const validator1 = new ConfigValidator({ N: ['null', 'number'] });
        const validator2 = new ConfigValidator({ N: ['number', 'null'] });

        expect(() => {
          validator1.castFromString({ N: 'not-null' });
        }).toThrow();

        expect(() => {
          validator2.castFromString({ N: 'not-null' });
        }).toThrow();
      });
    });
  });
});
