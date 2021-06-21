/* eslint-disable @typescript-eslint/no-explicit-any */
import PresenceTemplater from '../../../src/classes/presence/PresenceTemplater';
import ExtendedClient from '../../../src/classes/ExtendedClient';

jest.mock('discord.js', () => ({
  Client: class ClientClassMock {
    public options: any;
    public once: jest.Mock<any, any>
    public guilds: any;
    public users: any;
    public user: any;
  
    constructor(options: any) {
      this.options = options;
      this.once = jest.fn();
      this.guilds = {
        cache: {
          reduce: (fn: any) => [1, 2, 3].reduce(fn)
        }
      };
      this.users = {
        cache: {
          get: () => ({ username: 'owner' })
        }
      };
      this.user = { username: 'client' };
    }
  }
}));

const clientMock = new ExtendedClient({ prefix: '?', owner: '123' });

const dateToLocaleTimeStringSpy = jest.spyOn(Date.prototype, 'toLocaleTimeString');

describe('Classes: Presence: PresenceTemplater', () => {
  let templater: PresenceTemplater;

  beforeAll(() => {
    dateToLocaleTimeStringSpy.mockReturnValue('11:00PM');
  });

  beforeEach(() => {
    templater = new PresenceTemplater(clientMock);
  });

  describe('get()', () => {
    it('should throw if an unknown key is specified.', () => {
      expect(() => {
        templater.get('unknown');
      }).toThrow();
    });

    it('should return the string for key: num_guilds.', () => {
      expect(templater.get('num_guilds')).toBe('3');
    });

    it('should return the string for key: prefix.', () => {
      expect(templater.get('prefix')).toBe('?');
    });

    it('should return the string for key: cur_time.', () => {
      expect(templater.get('cur_time')).toBe('11:00PM');
    });

    it('should return the string for key: owner_name.', () => {
      expect(templater.get('owner_name')).toBe('owner');
    });

    it('should return the string for key: client_name.', () => {
      expect(templater.get('client_name')).toBe('client');
    });
  });
});
