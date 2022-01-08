/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
import PresenceManager from '../../../src/classes/presence/PresenceManager';
import ExtendedClient from '../../../src/classes/ExtendedClient';

const mockedTemplates = ['1 servers!', 'hello', 'client'];

describe('Classes: Presence: PresenceManager', () => {
  let clientMock: ExtendedClient;
  let setPresenceSpy: jest.Mock;

  let manager: PresenceManager;

  beforeEach(() => {
    clientMock = new ExtendedClient({ prefix: '?', owner: '123', debug: true, intents: [] });
    setPresenceSpy = clientMock.user?.setPresence as jest.Mock;

    manager = new PresenceManager(clientMock, { templates: mockedTemplates });
  });

  describe('update()', () => {
    it('should call setPresence with the correct options if no data is provided.', () => {
      expect.assertions(1);

      return manager.update('status')!
        .then(() => {
          expect(setPresenceSpy).toHaveBeenCalledWith({
            activities: [{
              name: 'status',
              type: manager.options.type
            }],
            status: manager.options.status,
            afk: manager.options.afk
          });
        });
    });

    it('should call setPresence with the correct options if partial data is provided.', () => {
      expect.assertions(1);

      return manager.update('status', { type: 'LISTENING' })!
        .then(() => {
          expect(setPresenceSpy).toHaveBeenCalledWith({
            activities: [{
              name: 'status',
              type: 'LISTENING'
            }],
            status: manager.options.status,
            afk: manager.options.afk
          });
        });
    });

    it('should emit a presenceUpdated event on resolve.', () => {
      expect.assertions(1);

      return manager.update('status')!
        .then(() => {
          expect(clientMock.emit).toHaveBeenCalledWith('presenceUpdated', 'status', expect.anything());
        });
    });

    it('should emit a presenceUpdateError event on reject.', () => {
      const expectedError = new Error('oops');
      setPresenceSpy.mockImplementationOnce(() => {
        throw expectedError;
      });

      expect.assertions(1);

      return manager.update('status')!
        .then(() => {
          expect(clientMock.emit).toHaveBeenCalledWith('presenceUpdateError', expectedError, 'status', expect.anything());
        });
    });
  });

  describe('setRefreshInterval()', () => {
    let clearIntervalSpy: any;

    beforeEach(() => {
      jest.useFakeTimers();
      clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    });

    afterEach(() => {
      manager.setRefreshInterval(null);
      jest.useRealTimers();
    });

    afterAll(() => {
      clearIntervalSpy.mockRestore();
    });

    it('should set refreshInterval and refreshIntervalHandle to null if null is passed.', () => {
      manager.setRefreshInterval(null);
      expect(manager.options.refreshInterval).toBeNull();
      expect(manager['refreshIntervalHandle']).toBeNull();
    });

    it('should set refreshInterval and refreshIntervalHandle to null if nothing is passed.', () => {
      manager.setRefreshInterval();
      expect(manager.options.refreshInterval).toBeNull();
      expect(manager['refreshIntervalHandle']).toBeNull();
    });

    it('should set refreshInterval and refreshIntervalHandle when a time is passed.', () => {
      manager.setRefreshInterval(10000);
      expect(manager.options.refreshInterval).toBe(10000);
      expect(manager['refreshIntervalHandle']).not.toBeNull();
    });

    it('should throw if refreshInterval is negative.', () => {
      expect(() => {
        manager.setRefreshInterval(-10);
      }).toThrow();
    });

    it('should clearInterval if setting to null when previously there was an interval present.', () => {
      manager.setRefreshInterval(1000);
      const oldHandle = manager['refreshIntervalHandle'];
      manager.setRefreshInterval(null);

      expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
      expect(clearIntervalSpy).toHaveBeenCalledWith(oldHandle);
    });

    it('should clearInterval if setting a new interval if there was a previous one.', () => {
      manager.setRefreshInterval(1000);
      const oldHandle = manager['refreshIntervalHandle'];
      manager.setRefreshInterval(1000);

      expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
      expect(clearIntervalSpy).toHaveBeenCalledWith(oldHandle);
    });

    it('should update presence when interval hits.', async() => {
      const updateSpy = jest.spyOn(manager, 'update');

      manager.setRefreshInterval(1000);
      jest.advanceTimersToNextTimer();
      expect(updateSpy).toHaveBeenCalledTimes(2); // Initial + Timer.
    });

    it('should emit a presenceRefreshInterval event when refreshInterval has been removed.', () => {
      manager.setRefreshInterval(null);
      expect(clientMock.emit).toHaveBeenCalledWith('presenceRefreshInterval', null);
    });

    it('should emit a presenceRefreshInterval event when refreshInterval has been updated.', () => {
      manager.setRefreshInterval(1000);
      expect(clientMock.emit).toHaveBeenCalledWith('presenceRefreshInterval', 1000);
    });
  });
});
