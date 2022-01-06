import { mocked } from 'ts-jest/utils';
import logger from '@greencoast/logger';
import Discord from 'discord.js';
import ExtraClientDefaultHandlers from '../../../src/classes/events/ExtraClientDefaultHandlers';
import ExtendedClient from '../../../src/classes/ExtendedClient';
import CommandGroup from '../../../src/classes/command/CommandGroup';
import ConcreteCommand from '../../../__mocks__/command';

jest.mock('@greencoast/logger');

const mockedLogger = mocked(logger, true);

const clientMock = new ExtendedClient();
const guildMock = new Discord.Guild(clientMock, {});
const channelMock = new Discord.TextChannel(guildMock, {});
const messageMock = new Discord.Message(clientMock, {}, channelMock);
const commandMock = new ConcreteCommand(clientMock);
const groupMock = new CommandGroup('group', 'Group');

describe('Classes: Events: ExtraClientDefaultHandlers', () => {
  beforeEach(() => {
    mockedLogger.info.mockClear();
    mockedLogger.warn.mockClear();
    mockedLogger.error.mockClear();
  });

  describe('onDataProviderAdd()', () => {
    it('should call logger.info.', () => {
      ExtraClientDefaultHandlers.onDataProviderAdd();
      expect(mockedLogger.info).toHaveBeenCalledTimes(1);
    });
  });

  describe('onDataProviderClear()', () => {
    it('should call logger.warn with guild name if guild is provided.', () => {
      ExtraClientDefaultHandlers.onDataProviderClear(guildMock);
      expect(mockedLogger.warn).toHaveBeenCalledTimes(1);
      expect(mockedLogger.warn.mock.calls[0][0]).toContain('guild');
    });

    it('should call logger.warn with global keys if guild is null.', () => {
      ExtraClientDefaultHandlers.onDataProviderClear(null);
      expect(mockedLogger.warn).toHaveBeenCalledTimes(1);
      expect(mockedLogger.warn.mock.calls[0][0]).toContain('global keys');
    });
  });

  describe('onDataProviderInit()', () => {
    it('should call logger.info.', () => {
      ExtraClientDefaultHandlers.onDataProviderInit();
      expect(mockedLogger.info).toHaveBeenCalledTimes(1);
    });
  });

  describe('onDataProviderDestroy()', () => {
    it('should call logger.warn.', () => {
      ExtraClientDefaultHandlers.onDataProviderDestroy();
      expect(mockedLogger.warn).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('onCommandExecute()', () => {
    it('should call logger.info.', () => {
      ExtraClientDefaultHandlers.onCommandExecute(commandMock, messageMock);
      expect(mockedLogger.info).toHaveBeenCalledTimes(1);
    });
  });

  describe('onCommandError()', () => {
    it('should call logger.error.', () => {
      const expectedError = new Error('oops');
      ExtraClientDefaultHandlers.onCommandError(expectedError, commandMock, messageMock);
      expect(mockedLogger.error).toHaveBeenCalledTimes(3);
      expect(mockedLogger.error).toHaveBeenCalledWith(expectedError);
    });
  });

  describe('onGroupRegistered()', () => {
    it('should call logger.info.', () => {
      ExtraClientDefaultHandlers.onGroupRegistered(groupMock);
      expect(mockedLogger.info).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('onCommandRegistered()', () => {
    it('should call logger.info.', () => {
      ExtraClientDefaultHandlers.onCommandRegistered(commandMock);
      expect(mockedLogger.info).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('onPresenceUpdated()', () => {
    it('should call logger.info.', () => {
      ExtraClientDefaultHandlers.onPresenceUpdated('status');
      expect(mockedLogger.info).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('onPresenceUpdateError()', () => {
    it('should call logger.error.', () => {
      const expectedError = new Error('oops');
      ExtraClientDefaultHandlers.onPresenceUpdateError(expectedError);
      expect(mockedLogger.error).toHaveBeenCalledTimes(2);
      expect(mockedLogger.error).toHaveBeenCalledWith(expectedError);
    });
  });
  
  describe('onPresenceRefreshInterval()', () => {
    it('should info log if the refresh interval is disabled.', () => {
      ExtraClientDefaultHandlers.onPresenceRefreshInterval(null);
      expect(mockedLogger.info).toHaveBeenCalledTimes(1);
      expect(mockedLogger.info.mock.calls[0][0].endsWith('disabled.')).toBe(true);
    });

    it('should info log if the refresh interval is enabled.', () => {
      ExtraClientDefaultHandlers.onPresenceRefreshInterval(1000);
      expect(mockedLogger.info).toHaveBeenCalledTimes(1);
      expect(mockedLogger.info.mock.calls[0][0].endsWith('1000ms.')).toBe(true);
    });
  });
});