/* eslint-disable @typescript-eslint/no-explicit-any */
import { mocked } from 'ts-jest/utils';
import logger from '@greencoast/logger';
import PresenceManager from '../../../src/classes/presence/PresenceManager';
import ExtendedClient from '../../../src/classes/ExtendedClient';

jest.mock('@greencoast/logger');

const mockedLogger = mocked(logger, true);

const clientMock = new ExtendedClient({ prefix: '?', owner: '123' });
const mockedTemplates = ['{num_guilds} servers!', 'hello', '{client_name}'];

describe('Classes: Presence: PresenceManager', () => {
  let manager: PresenceManager;

  beforeEach(() => {
    manager = new PresenceManager(clientMock, { templates: mockedTemplates });

    mockedLogger.info.mockClear();
    mockedLogger.error.mockClear();
  });

  describe('update()', () => {
    it('should call setPresence with the correct options if no data is provided.', () => {
      expect.assertions(1);

      return manager.update('status')!
        .then(() => {
          expect(manager.client.user?.setPresence).toHaveBeenCalledWith({
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
          expect(manager.client.user?.setPresence).toHaveBeenCalledWith({
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
      const setPresenceSpy = clientMock.user?.setPresence as jest.Mock<any, any>;
      setPresenceSpy.mockRejectedValueOnce(expectedError);

      expect.assertions(2);

      return manager.update('status')!
        .then(() => {
          expect(mockedLogger.error).toHaveBeenCalledTimes(2);
          expect(mockedLogger.error).toHaveBeenCalledWith(expectedError);
        });
    });
  });
});
