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
    public uptime: number;
    public readyTimestamp: number;
  
    constructor(options: any) {
      this.options = options;
      this.once = jest.fn();
      this.guilds = {
        cache: {
          reduce: (fn: any, initial: any) => {
            return [{ memberCount: 10 }, { memberCount: 5 }, { memberCount: 2 }].reduce(fn, initial);
          }
        }
      };
      this.users = {
        cache: {
          get: () => ({ username: 'owner' })
        }
      };
      this.user = { username: 'client' };
      this.uptime = 15341235221;
      this.readyTimestamp = 123123123123123;
    }
  }
}));

const clientMock = new ExtendedClient({ prefix: '?', owner: '123' });

const dateToLocaleTimeStringSpy = jest.spyOn(Date.prototype, 'getTime');

describe('Classes: Presence: PresenceTemplater', () => {
  let templater: PresenceTemplater;

  beforeAll(() => {
    dateToLocaleTimeStringSpy.mockReturnValue(1293872389);
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
      expect(templater.get('cur_time')).toBe('06:24:32 PM');
    });

    it('should return the string for key: owner_name.', () => {
      expect(templater.get('owner_name')).toBe('owner');
    });

    it('should return the string for key: client_name.', () => {
      expect(templater.get('client_name')).toBe('client');
    });

    it('should return the string for key: uptime.', () => {
      expect(templater.get('uptime')).toBe('177 days, 13 hours and 27 minutes');
    });

    it('should return the string for key: ready_time.', () => {
      expect(templater.get('ready_time')).toBe('Sun, 13/08/71 @22:08:PM');
    });

    it('should return the string for key: num_members.', () => {
      expect(templater.get('num_members')).toBe('17');
    });
  });
});
