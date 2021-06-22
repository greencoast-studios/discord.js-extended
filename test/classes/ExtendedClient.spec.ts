/* eslint-disable @typescript-eslint/no-explicit-any */
import ExtendedClient from '../../src/classes/ExtendedClient';
import ConcreteDataProvider from '../../__mocks__/dataProvider';

const MOCKED_OWNER_ID = '123';

describe('Classes: ExtendedClient', () => {
  let client: ExtendedClient;

  beforeEach(() => {
    client = new ExtendedClient({ owner: MOCKED_OWNER_ID });
  });

  it('should have an options property.', () => {
    expect(client).toHaveProperty('options');
  });

  it('should have a prefix property.', () => {
    expect(client).toHaveProperty('prefix');
  });

  it('should have a debug property.', () => {
    expect(client).toHaveProperty('debug');
  });

  it('should have an owner property.', () => {
    expect(client).toHaveProperty('owner');
  });

  it('should have a config property.', () => {
    expect(client).toHaveProperty('config');
  });

  describe('constructor', () => {
    let onceSpy: jest.Mock<any, any>;
    let fetchSpy: jest.Mock<any, any>;

    beforeEach(() => {
      onceSpy = client.once as jest.Mock<any, any>;
      fetchSpy = client.users.fetch as jest.Mock<any, any>;
    });

    it('should not fetch the owner in the constructor if no owner was provided.', () => {
      client = new ExtendedClient();
      expect(client.once).not.toHaveBeenCalledWith('ready', expect.anything());
    });
  
    it('should fetch the owner in the constructor if an owner was provided.', () => {
      const listener = onceSpy.mock.calls[0][1].bind(client);
      
      expect.assertions(2);
      return listener()
        .then(() => {
          expect(client.once).toHaveBeenCalledWith('ready', expect.anything());
          expect(client.users.fetch).toHaveBeenCalledWith(MOCKED_OWNER_ID);
        });
    });
  
    it('should emit a warn and error event in the constructor if the owner does not exist.', () => {
      const expectedError = new Error('oops');
      fetchSpy.mockImplementation(() => Promise.reject(expectedError));

      const listener = onceSpy.mock.calls[0][1].bind(client);
  
      expect.assertions(3);
      return listener()
        .then(() => {
          expect(client.once).toHaveBeenCalledWith('ready', expect.anything());
          expect(client.emit).toHaveBeenCalledWith('warn', expect.anything());
          expect(client.emit).toHaveBeenCalledWith('error', expectedError);
        });
    });
  });

  describe('get owner()', () => {
    it('should return undefined if no owner is provided.', () => {
      client = new ExtendedClient();
      expect(client.owner).toBeUndefined();
    });

    it('should get the user from the cache if an owner was provided.', () => {
      client.owner;
      expect(client.users.cache.get).toHaveBeenCalledTimes(1);
      expect(client.users.cache.get).toHaveBeenCalledWith(MOCKED_OWNER_ID);
    });
  });

  describe('setDataProvider()', () => {
    it('should update the dataProvider property.', () => {
      const provider = new ConcreteDataProvider(client);

      expect.assertions(1);

      return client.setDataProvider(provider)
        .then(() => {
          expect(client.dataProvider).toBe(provider);
        });
    });
  });

  describe('isOwner()', () => {
    let resolveSpy: jest.Mock<any, any>;

    beforeEach(() => {
      resolveSpy = client.users.resolve as jest.Mock<any, any>;
      resolveSpy.mockReturnValue({ id: '22' });
    });

    it('should return false if no owner is provided.', () => {
      client = new ExtendedClient();
      expect(client.isOwner('22')).toBe(false);
    });

    it('should throw if the given user is not resolvable.', () => {
      resolveSpy.mockReturnValue(null);
      expect(() => {
        client.isOwner('123');
      }).toThrow();
    });

    it('should return false if the given user is not the owner.', () => {
      resolveSpy.mockReturnValue({ id: '22' });
      expect(client.isOwner(MOCKED_OWNER_ID)).toBe(false);
    });

    it('should return true if the give user is the owner.', () => {
      resolveSpy.mockReturnValue({ id: MOCKED_OWNER_ID });
      expect(client.isOwner(MOCKED_OWNER_ID)).toBe(true);
    });
  });

  describe('registerDefaultEvents()', () => {
    it('should return this.', () => {
      expect(client.registerDefaultEvents()).toBe(client);
    });

    it('should register all default events.', () => {
      const DEFAULT_EVENTS = ['error', 'guildCreate', 'guildDelete', 'guildUnavailable', 'invalidated', 'rateLimit', 'ready', 'warn'];

      client.registerDefaultEvents();

      DEFAULT_EVENTS.forEach((event) => {
        expect(client.on).toHaveBeenCalledWith(event, expect.anything());
      });
    });

    it('should register debug event if debug is enabled.', () => {
      client = new ExtendedClient({ debug: true });
      client.registerDefaultEvents();

      expect(client.on).toHaveBeenCalledWith('debug', expect.anything());
    });

    it('should not register debug event if debug is disabled.', () => {
      client.registerDefaultEvents();

      expect(client.on).not.toHaveBeenCalledWith('debug', expect.anything());
    });
  });
});
