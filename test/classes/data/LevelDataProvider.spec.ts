import { mocked } from 'jest-mock';
import * as level from 'level';
import { Guild } from 'discord.js';
import LevelDataProvider from '../../../src/classes/data/LevelDataProvider';
import ExtendedClient from '../../../src/classes/ExtendedClient';
import { GuildMock } from '../../../__mocks__/discordMocks';

jest.mock('level');

const { Level: mockedLevel } = mocked(level, { shallow: true });

const clientMock = new ExtendedClient({ debug: true, intents: [] });

describe('Classes: Data: LevelDataProvider', () => {
  const emitSpy = clientMock.emit as jest.Mock;

  let provider: LevelDataProvider;

  beforeEach(() => {
    provider = new LevelDataProvider(clientMock, 'path');

    emitSpy.mockClear();
  });

  describe('init()', () => {
    it('should resolve the provider object.', () => {
      expect.assertions(1);

      return provider.init()
        .then((resolved) => {
          expect(resolved).toBe(provider);
        });
    });

    it('should set the db.', () => {
      expect.assertions(1);

      return provider.init()
        .then(() => {
          expect(provider['db']).toBeInstanceOf(level.Level);
        });
    });

    it('should emit a dataProviderInit event.', () => {
      expect.assertions(1);

      return provider.init()
        .then(() => {
          expect(clientMock.emit).toHaveBeenCalledWith('dataProviderInit', provider);
        });
    });

    it('should reject if an error comes up.', () => {
      const expectedError = new Error('oops');
      mockedLevel.mockImplementationOnce((_str: string, _obj: any, fn: any) => fn(expectedError));

      expect.assertions(1);

      return provider.init()
        .catch((error) => {
          expect(error).toBe(expectedError);
        });
    });

    it('should not re-initialize the provider if it is ready.', () => {
      expect.assertions(1);

      return provider.init()
        .then(() => {
          mockedLevel.mockClear();
          return provider.init();
        })
        .then(() => {
          expect(mockedLevel).not.toHaveBeenCalled();
        });
    });
  });

  describe('destroy()', () => {
    beforeEach(async () => {
      await provider.init();
    });

    it('should resolve if there is no db initialized.', () => {
      provider = new LevelDataProvider(clientMock, 'path');

      expect.assertions(1);

      return provider.destroy()
        .then(() => {
          expect(provider['db']).toBeNull();
        });
    });

    it('should set the db to null.', () => {
      expect.assertions(1);

      return provider.destroy()
        .then(() => {
          expect(provider['db']).toBeNull();
        });
    });

    it('should emit a dataProviderDestroy event.', () => {
      expect.assertions(1);

      return provider.destroy()
        .then(() => {
          expect(clientMock.emit).toHaveBeenCalledWith('dataProviderDestroy', provider);
        });
    });

    it('should reject if there was an error.', () => {
      const expectedError = new Error('oops');
      const closeSpy = jest.spyOn(provider['db'] as any, 'close');
      closeSpy.mockImplementation((fn: any) => fn(expectedError));

      expect.assertions(1);

      return provider.destroy()
        .catch((error) => {
          expect(error).toBe(expectedError);
        });
    });
  });

  describe('Data methods:', () => {
    const guild = new GuildMock() as Guild;

    const data = [
      ['key1', 'value1'],
      ['key2', { val: 'value2' }],
      ['key3', [1, 2, 3]]
    ];

    beforeEach(async () => {
      await provider.init();

      for (const [k, v] of data) {
        await provider.set(guild, k as string, v);
      }
      await provider.setGlobal('globalKey', 'globalValue');
    });

    describe('get()', () => {
      it('should resolve the value stored.', () => {
        expect.assertions(3);

        return Promise.all(data.map(([k]) => provider.get(guild, k as string)))
          .then((resolved) => {
            const values = data.map(([, v]) => v);
            resolved.forEach((value) => {
              expect(values).toContainEqual(value);
            });
          });
      });

      it('should resolve with the default value if the key was not found.', () => {
        expect.assertions(1);

        return provider.get(guild, 'unknown', 'default')
          .then((value) => {
            expect(value).toBe('default');
          });
      });

      it('should resolve undefined if the key was not found and no default value is given.', () => {
        expect.assertions(1);

        return provider.get(guild, 'unknown')
          .then((value) => {
            expect(value).toBeUndefined();
          });
      });

      it('should reject if there was an error.', () => {
        const expectedError = new Error('oops');
        const getSpy = jest.spyOn(provider['db'] as any, 'get');
        getSpy.mockRejectedValue(expectedError);

        expect.assertions(1);

        return provider.get(guild, 'error')
          .catch((error) => {
            expect(error).toBe(expectedError);
          });
      });
    });

    describe('getGlobal()', () => {
      it('should resolve the value stored.', () => {
        expect.assertions(1);

        return provider.getGlobal('globalKey')
          .then((value) => {
            expect(value).toBe('globalValue');
          });
      });

      it('should resolve with the default value if the key was not found.', () => {
        expect.assertions(1);

        return provider.getGlobal('unknown', 'default')
          .then((value) => {
            expect(value).toBe('default');
          });
      });

      it('should resolve undefined if the key was not found and no default value is given.', () => {
        expect.assertions(1);

        return provider.getGlobal('unknown')
          .then((value) => {
            expect(value).toBeUndefined();
          });
      });

      it('should reject if there was an error.', () => {
        const expectedError = new Error('oops');
        const getSpy = jest.spyOn(provider['db'] as any, 'get');
        getSpy.mockRejectedValue(expectedError);

        expect.assertions(1);

        return provider.getGlobal('error')
          .catch((error) => {
            expect(error).toBe(expectedError);
          });
      });
    });

    describe('set()', () => {
      it('should set new data.', () => {
        expect.assertions(1);

        return provider.set(guild, 'newKey', 'newValue')
          .then(() => provider.get(guild, 'newKey'))
          .then((value) => {
            expect(value).toBe('newValue');
          });
      });

      it('should replace old data.', () => {
        expect.assertions(1);

        return provider.set(guild, 'key1', 'newValue')
          .then(() => provider.get(guild, 'key1'))
          .then((value) => {
            expect(value).toBe('newValue');
          });
      });
    });

    describe('setGlobal()', () => {
      it('should set new data.', () => {
        expect.assertions(1);

        return provider.setGlobal('newKey', 'newValue')
          .then(() => provider.getGlobal('newKey'))
          .then((value) => {
            expect(value).toBe('newValue');
          });
      });

      it('should replace old data.', () => {
        expect.assertions(1);

        return provider.setGlobal('globalKey', 'newValue')
          .then(() => provider.getGlobal('globalKey'))
          .then((value) => {
            expect(value).toBe('newValue');
          });
      });
    });

    describe('delete()', () => {
      it('should delete existing data.', () => {
        expect.assertions(1);

        return provider.delete(guild, 'key1')
          .then(() => provider.get(guild, 'key1'))
          .then((value) => {
            expect(value).toBeUndefined();
          });
      });

      it('should resolve the deleted data.', () => {
        expect.assertions(1);

        return provider.get(guild, 'key1')
          .then((old) => {
            return provider.delete(guild, 'key1')
              .then((deleted) => {
                expect(deleted).toBe(old);
              });
          });
      });

      it('should reject if the key is not found.', () => {
        expect.assertions(1);

        return provider.delete(guild, 'unknown')
          .catch((error) => {
            expect(error.name).toBe('NotFoundError');
          });
      });
    });

    describe('deleteGlobal()', () => {
      it('should delete existing data.', () => {
        expect.assertions(1);

        return provider.deleteGlobal('globalKey')
          .then(() => provider.getGlobal('globalKey'))
          .then((value) => {
            expect(value).toBeUndefined();
          });
      });

      it('should resolve the deleted data.', () => {
        expect.assertions(1);

        return provider.getGlobal('globalKey')
          .then((old) => {
            return provider.deleteGlobal('globalKey')
              .then((deleted) => {
                expect(deleted).toBe(old);
              });
          });
      });

      it('should reject if the key is not found.', () => {
        expect.assertions(1);

        return provider.deleteGlobal('unknown')
          .catch((error) => {
            expect(error.name).toBe('NotFoundError');
          });
      });
    });

    describe('clear()', () => {
      it('should delete all entries.', () => {
        expect.assertions(3);

        return provider.clear(guild)
          .then(() => {
            const keys = data.map(([k]) => k as string);
            return Promise.all(keys.map((key) => provider.get(guild, key)));
          })
          .then((resolved) => {
            resolved.forEach((value) => {
              expect(value).toBeUndefined();
            });
          });
      });

      it('should not modify the rest of the data.', () => {
        expect.assertions(1);

        return provider.clear(guild)
          .then(() => provider.getGlobal('globalKey'))
          .then((value) => {
            expect(value).toBe('globalValue');
          });
      });

      it('should emit a dataProviderClear event.', () => {
        expect.assertions(1);

        return provider.clear(guild)
          .then(() => {
            expect(clientMock.emit).toHaveBeenCalledWith('dataProviderClear', guild);
          });
      });
    });

    describe('clearGlobal()', () => {
      it('should delete all entries.', () => {
        expect.assertions(1);

        return provider.clearGlobal()
          .then(() => provider.getGlobal('globalKey'))
          .then((value) => {
            expect(value).toBeUndefined();
          });
      });

      it('should not modify the rest of the data.', () => {
        expect.assertions(3);

        return provider.clearGlobal()
          .then(() => {
            return Promise.all(data.map(([k]) => provider.get(guild, k as string)))
              .then((resolved) => {
                const values = data.map(([, v]) => v);
                resolved.forEach((value) => {
                  expect(values).toContainEqual(value);
                });
              });
          });
      });

      it('should emit a dataProviderClear event.', () => {
        expect.assertions(1);

        return provider.clearGlobal()
          .then(() => {
            expect(clientMock.emit).toHaveBeenCalledWith('dataProviderClear', null);
          });
      });
    });
  });
});
