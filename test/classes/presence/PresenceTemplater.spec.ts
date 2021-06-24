import dayjs from 'dayjs';
import PresenceTemplater from '../../../src/classes/presence/PresenceTemplater';
import ExtendedClient from '../../../src/classes/ExtendedClient';
import ConcreteCommand from '../../../__mocks__/command';

dayjs.tz.setDefault('Europe/Paris');

const clientMock = new ExtendedClient({ prefix: '?', owner: '123' });

const dateToLocaleTimeStringSpy = jest.spyOn(Date.prototype, 'getTime');

describe('Classes: Presence: PresenceTemplater', () => {
  let templater: PresenceTemplater;

  beforeAll(() => {
    dateToLocaleTimeStringSpy.mockReturnValue(1293872389);
    
    for (let i = 0; i < 3; i++) {
      const command = new ConcreteCommand(clientMock, { name: Math.random().toString() });
      clientMock.registry.commands.set(command.name, command);
    }
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
      expect(templater.get('cur_time')).toBe('12:24:32 AM');
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
      expect(templater.get('ready_time')).toBe('Mon, 14/08/71 @05:08:AM');
    });

    it('should return the string for key: num_members.', () => {
      expect(templater.get('num_members')).toBe('17');
    });

    it('should return the string for key: num_commands.', () => {
      expect(templater.get('num_commands')).toBe('3');
    });
  });
});
