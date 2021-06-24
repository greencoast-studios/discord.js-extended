/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { mocked } from 'ts-jest/utils';
import logger from '@greencoast/logger';
import PresenceManager from '../../../src/classes/presence/PresenceManager';
import ExtendedClient from '../../../src/classes/ExtendedClient';

jest.mock('@greencoast/logger');

const mockedLogger = mocked(logger, true);

const clientMock = new ExtendedClient({ prefix: '?', owner: '123', debug: true });
const mockedTemplates = ['1 servers!', 'hello', 'client'];

describe('Classes: Presence: PresenceManager', () => {
  const setPresenceSpy = clientMock.user?.setPresence as jest.Mock<any, any>;
  const emitSpy = clientMock.emit as jest.Mock<any, any>;

  let manager: PresenceManager;

  beforeEach(() => {
    manager = new PresenceManager(clientMock, { templates: mockedTemplates });

    mockedLogger.info.mockClear();
    mockedLogger.error.mockClear();
    setPresenceSpy.mockClear();
    emitSpy.mockClear();
  });

  describe('update()', () => {
    it('should call setPresence with the correct options if no data is provided.', () => {
      expect.assertions(1);

      return manager.update('status')!
        .then(() => {
          expect(setPresenceSpy).toHaveBeenCalledWith({
            activity: {
              name: 'status',
              type: manager.options.type
            },
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
            activity: {
              name: 'status',
              type: 'LISTENING'
            },
            status: manager.options.status,
            afk: manager.options.afk
          });
        });
    });

    it('should info log on resolve.', () => {
      expect.assertions(1);

      return manager.update('status')!
        .then(() => {
          expect(mockedLogger.info).toHaveBeenCalledTimes(1);
        });
    });

    it('should error log on reject.', () => {
      const expectedError = new Error('oops');
      setPresenceSpy.mockRejectedValueOnce(expectedError);

      expect.assertions(2);

      return manager.update('status')!
        .then(() => {
          expect(mockedLogger.error).toHaveBeenCalledTimes(2);
          expect(mockedLogger.error).toHaveBeenCalledWith(expectedError);
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

    it('should update presence when interval hits.', () => {
      manager.setRefreshInterval(1000);
      jest.advanceTimersToNextTimer();
      expect(mockedTemplates).toContain(setPresenceSpy.mock.calls[0][0].activity.name);
    });

    it('should emit a debug event when refreshInterval has been removed.', () => {
      manager.setRefreshInterval(null);
      expect(clientMock.emit).toHaveBeenCalledTimes(1);
      expect(clientMock.emit).toHaveBeenCalledWith('debug', expect.anything());
    });

    it('should emit a debug event when refreshInterval has been updated.', () => {
      manager.setRefreshInterval(1000);
      expect(clientMock.emit).toHaveBeenCalledTimes(1);
      expect(clientMock.emit).toHaveBeenCalledWith('debug', expect.anything());
    });
  });
});
