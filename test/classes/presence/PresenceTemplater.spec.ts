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
    it('should reject if an unknown key is specified.', () => {
      expect.assertions(1);

      return templater.get('unknown')
        .catch((err) => {
          expect(err).toBeInstanceOf(Error);
        });
    });

    it('should return the string for key: num_guilds.', async() => {
      expect(await templater.get('num_guilds')).toBe('3');
    });

    it('should return the string for key: prefix.', async() => {
      expect(await templater.get('prefix')).toBe('?');
    });

    it('should return the string for key: cur_time.', async() => {
      expect(await templater.get('cur_time')).toBe('12:24:32 AM');
    });

    it('should return the string for key: owner_name.', async() => {
      expect(await templater.get('owner_name')).toBe('owner');
    });

    it('should return the string for key: client_name.', async() => {
      expect(await templater.get('client_name')).toBe('client');
    });

    it('should return the string for key: uptime.', async() => {
      expect(await templater.get('uptime')).toBe('177 days, 13 hours and 27 minutes');
    });

    it('should return the string for key: ready_time.', async() => {
      expect(await templater.get('ready_time')).toBe('Mon, 14/08/71 @05:08:AM');
    });

    it('should return the string for key: num_members.', async() => {
      expect(await templater.get('num_members')).toBe('17');
    });

    it('should return the string for key: num_commands.', async() => {
      expect(await templater.get('num_commands')).toBe('3');
    });
  });
});
