import { mocked } from 'jest-mock';
import * as logger from '@greencoast/logger';
import { Guild } from 'discord.js';
import ClientDefaultHandlers from '../../../src/classes/events/ClientDefaultHandlers';
import { GuildMock } from '../../../__mocks__/discordMocks';

jest.mock('@greencoast/logger');

const mockedLogger = mocked(logger, { shallow: true });
const processExitSpy = jest.spyOn(process, 'exit');

const guildMock = new GuildMock() as Guild;

describe('Classes: Events: ClientDefaultHandlers', () => {
  beforeAll(() => {
    processExitSpy.mockImplementation((code?: number) => code as never);
  });

  beforeEach(() => {
    mockedLogger.debug.mockClear();
    mockedLogger.error.mockClear();
    mockedLogger.info.mockClear();
    mockedLogger.warn.mockClear();
    mockedLogger.fatal.mockClear();

    processExitSpy.mockClear();
  });

  describe('onDebug()', () => {
    const info = 'Debug info';

    it('should call logger.debug with the info.', () => {
      ClientDefaultHandlers.onDebug(info);
      expect(mockedLogger.debug).toHaveBeenCalledTimes(1);
      expect(mockedLogger.debug).toHaveBeenCalledWith(info);
    });
  });

  describe('onError()', () => {
    const error = new Error('Oops');

    it('should call logger.error with the error.', () => {
      ClientDefaultHandlers.onError(error);
      expect(mockedLogger.error).toHaveBeenCalledTimes(1);
      expect(mockedLogger.error).toHaveBeenCalledWith(error);
    });
  });

  describe('onGuildCreate()', () => {
    it('should call logger.info with the guild name.', () => {
      ClientDefaultHandlers.onGuildCreate(guildMock);
      expect(mockedLogger.info).toBeCalledTimes(1);
      expect(mockedLogger.info.mock.calls[0][0]).toContain(guildMock.name);
    });
  });

  describe('onGuildDelete()', () => {
    it('should call logger.info with the guild name.', () => {
      ClientDefaultHandlers.onGuildDelete(guildMock);
      expect(mockedLogger.info).toBeCalledTimes(1);
      expect(mockedLogger.info.mock.calls[0][0]).toContain(guildMock.name);
    });
  });

  describe('onGuildUnavailable()', () => {
    it('should call logger.warn with the guild name.', () => {
      ClientDefaultHandlers.onGuildUnavailable(guildMock);
      expect(mockedLogger.warn).toBeCalledTimes(1);
      expect(mockedLogger.warn.mock.calls[0][0]).toContain(guildMock.name);
    });
  });

  describe('onInvalidated()', () => {
    it('should call logger.fatal.', () => {
      ClientDefaultHandlers.onInvalidated();
      expect(mockedLogger.fatal).toHaveBeenCalledTimes(1);
    });

    it('should call process.exit with code 1.', () => {
      ClientDefaultHandlers.onInvalidated();
      expect(processExitSpy).toHaveBeenCalledTimes(1);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('onInvalidRequestWarning()', () => {
    it('should call logger.warn with the request data.', () => {
      const data = { count: 1, remainingTime: 100 };
      ClientDefaultHandlers.onInvalidRequestWarning(data);
      expect(mockedLogger.warn).toBeCalledTimes(2);
      expect(mockedLogger.warn.mock.calls[1][0]).toBe(data);
    });
  });

  describe('onReady()', () => {
    it('should call logger.info.', () => {
      ClientDefaultHandlers.onReady();
      expect(mockedLogger.info).toHaveBeenCalledTimes(1);
    });
  });

  describe('onWarn()', () => {
    const info = 'Warning';

    it('should call logger.warn with the info.', () => {
      ClientDefaultHandlers.onWarn(info);
      expect(mockedLogger.warn).toHaveBeenCalledTimes(1);
      expect(mockedLogger.warn).toHaveBeenCalledWith(info);
    });
  });
});
