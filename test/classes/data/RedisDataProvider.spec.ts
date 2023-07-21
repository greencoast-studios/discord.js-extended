import Discord from 'discord.js';
import RedisDataProvider from '../../../src/classes/data/RedisDataProvider';
import ExtendedClient from '../../../src/classes/ExtendedClient';
import { GuildMock } from '../../../__mocks__/discordMocks';

jest.mock('redis');

const clientMock = new ExtendedClient();

describe('Classes: Data: RedisDataProvider', () => {
  const emitSpy = clientMock.emit as jest.Mock;
  let provider: RedisDataProvider;
  let redis: any;

  beforeEach(() => {
    provider = new RedisDataProvider(clientMock, { url: 'redis://url' });
    redis = provider['redis'];

    emitSpy.mockClear();
  });

  describe('on()', () => {
    it('should delegate to the redis on event registry.', () => {
      provider.on('event', () => null);

      expect(redis.on).toHaveBeenCalledWith('event', expect.anything());
    });
  });

  describe('init()', () => {
    it('should resolve the provider object.', () => {
      expect.assertions(1);

      return provider.init()
        .then((resolved) => {
          expect(resolved).toBe(provider);
        });
    });

    it('should connect to the redis instance.', () => {
      expect.assertions(1);

      return provider.init()
        .then(() => {
          expect(redis.connect).toHaveBeenCalled();
        });
    });

    it('should register the error event for the redis instance.', () => {
      expect.assertions(1);

      return provider.init()
        .then(() => {
          expect(redis.on).toHaveBeenCalledWith('error', expect.anything());
        });
    });

    it('should emit a dataProviderInit event.', () => {
      expect.assertions(1);

      return provider.init()
        .then(() => {
          expect(clientMock.emit).toHaveBeenCalledWith('dataProviderInit', provider);
        });
    });
  });

  describe('destroy()', () => {
    it('should emit a dataProviderDestroy event.', () => {
      expect.assertions(1);

      return provider.destroy()
        .then(() => {
          expect(clientMock.emit).toHaveBeenCalledWith('dataProviderDestroy', provider);
        });
    });

    it('should close the redis connection.', () => {
      return provider.destroy()
        .then(() => {
          expect(redis.quit).toHaveBeenCalled();
        });
    });
  });

  describe('Data methods:', () => {
    const guild = new GuildMock() as Discord.Guild;

    const data = [
      ['key1', 'value1'],
      ['key2', { val: 'value2' }],
      ['key3', [1, 2, 3]]
    ];

    beforeEach(async () => {
      for (const [k, v] of data) {
        await provider.set(guild, k as string, v);
      }
      await provider.setGlobal('globalKey', 'globalValue');
    });

    describe('get()', () => {
      it('should resolve the value stored.', async () => {
        const val1 = await provider.get(guild, 'key1');
        const val2 = await provider.get(guild, 'key2');
        const val3 = await provider.get(guild, 'key3');

        expect(val1).toEqual(data[0][1]);
        expect(val2).toEqual(data[1][1]);
        expect(val3).toEqual(data[2][1]);
      });

      it('should resolve with the default value if the key was not found.', async () => {
        const val = await provider.get(guild, 'unknown', 'default');

        expect(val).toBe('default');
      });

      it('should resolve undefined if the key was not found and no default value is given.', async () => {
        const val = await provider.get(guild, 'unknown');

        expect(val).toBeUndefined();
      });
    });

    describe('getGlobal()', () => {
      it('should resolve the value stored.', async () => {
        const val = await provider.getGlobal('globalKey');

        expect(val).toBe('globalValue');
      });

      it('should resolve with the default value if the key was not found.', async () => {
        const val = await provider.getGlobal('unknown', 'default');

        expect(val).toBe('default');
      });

      it('should resolve undefined if the key was not found and no default value is given.', async () => {
        const val = await provider.getGlobal('unknown');

        expect(val).toBeUndefined();
      });
    });

    describe('set()', () => {
      it('should set new data.', async () => {
        await provider.set(guild, 'newKey', 'newValue');
        const stored = await provider.get(guild, 'newKey');

        expect(stored).toBe('newValue');
      });

      it('should replace old data.', async () => {
        const old = await provider.get(guild, 'key1');
        await provider.set(guild, 'key1', 'new_value');
        const stored = await provider.get(guild, 'key1');

        expect(stored).not.toBe(old);
        expect(stored).toBe('new_value');
      });
    });

    describe('setGlobal()', () => {
      it('should set new data.', async () => {
        await provider.setGlobal('newKey', 'newValue');
        const stored = await provider.getGlobal('newKey');

        expect(stored).toBe('newValue');
      });

      it('should replace old data.', async () => {
        const old = await provider.getGlobal('key1');
        await provider.setGlobal('key1', 'new_value');
        const stored = await provider.getGlobal('key1');

        expect(stored).not.toBe(old);
        expect(stored).toBe('new_value');
      });
    });

    describe('delete()', () => {
      it('should delete existing data.', async () => {
        const old = await provider.get(guild, 'key1');
        await provider.delete(guild, 'key1');
        const stored = await provider.get(guild, 'key1');

        expect(stored).not.toBe(old);
        expect(stored).toBeUndefined();
      });

      it('should resolve the deleted data.', async () => {
        const old = await provider.get(guild, 'key1');
        const deleted = await provider.delete(guild, 'key1');

        expect(old).toBe(deleted);
      });
    });

    describe('deleteGlobal()', () => {
      it('should delete existing data.', async () => {
        const old = await provider.getGlobal('globalKey');
        await provider.deleteGlobal('globalKey');
        const stored = await provider.getGlobal('globalKey');

        expect(stored).not.toBe(old);
        expect(stored).toBeUndefined();
      });

      it('should resolve the deleted data.', async () => {
        const old = await provider.getGlobal('globalKey');
        const deleted = await provider.deleteGlobal('globalKey');

        expect(old).toBe(deleted);
      });
    });

    describe('clear()', () => {
      it('should delete all entries.', async () => {
        await provider.clear(guild);

        expect(await provider.get(guild, 'key1')).toBeUndefined();
        expect(await provider.get(guild, 'key2')).toBeUndefined();
        expect(await provider.get(guild, 'key3')).toBeUndefined();
      });

      it('should not modify the rest of the data.', async () => {
        await provider.clear(guild);

        expect(await provider.getGlobal('globalKey')).toBe('globalValue');
      });

      it('should emit a dataProviderClear event.', async () => {
        await provider.clear(guild);

        expect(clientMock.emit).toHaveBeenCalledWith('dataProviderClear', guild);
      });
    });

    describe('clearGlobal()', () => {
      it('should delete all entries.', async () => {
        await provider.clearGlobal();

        expect(await provider.getGlobal('globalKey')).toBeUndefined();
      });

      it('should not modify the rest of the data.', async () => {
        await provider.clearGlobal();

        expect(await provider.get(guild, 'key1')).toEqual(data[0][1]);
        expect(await provider.get(guild, 'key2')).toEqual(data[1][1]);
        expect(await provider.get(guild, 'key3')).toEqual(data[2][1]);
      });

      it('should emit a dataProviderClear event.', async () => {
        await provider.clearGlobal();

        expect(clientMock.emit).toHaveBeenCalledWith('dataProviderClear', null);
      });
    });
  });
});
