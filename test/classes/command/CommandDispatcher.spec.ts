/* eslint-disable @typescript-eslint/no-explicit-any */
import { mocked } from 'ts-jest/utils';
import Discord from 'discord.js';
import logger from '@greencoast/logger';
import CommandDispatcher from '../../../src/classes/command/CommandDispatcher';
import CommandRegistry from '../../../src/classes/command/CommandRegistry';
import ExtendedClient from '../../../src/classes/ExtendedClient';
import Command from '../../../src/classes/command/Command';
import ConcreteCommand from '../../../__mocks__/command';

jest.mock('discord.js');
jest.mock('@greencoast/logger');

const mockedLogger = mocked(logger, true);

const clientMock = new ExtendedClient({ prefix: '!' });

describe('Classes: Command: CommandDispatcher', () => {
  let dispatcher: CommandDispatcher;
  let registry: CommandRegistry;
  let registryGetCommandSpy: jest.SpyInstance<any, any>;
  let command: Command;
  let message: Discord.Message;

  beforeEach(() => {
    command = new ConcreteCommand(clientMock);
    command.run = jest.fn();
    command.onError = jest.fn();

    registry = new CommandRegistry(clientMock);
    dispatcher = new CommandDispatcher(clientMock, registry);
    registryGetCommandSpy = jest.spyOn(registry.commands, 'get').mockReturnValue(command);
    message = new Discord.Message(clientMock, {}, new Discord.TextChannel(new Discord.Guild(clientMock, {}), {}));
    message.content = '!command';

    mockedLogger.info.mockClear();
  });

  describe('handleMessage()', () => {
    it('should not run the command if the message is a partial.', () => {
      Object.defineProperty(message, 'partial', { value: true });

      return dispatcher.handleMessage(message)
        .then(() => {
          expect(command.run).not.toHaveBeenCalled();
        });
    });

    it('should not run the command if the message comes from a bot.', () => {
      Object.defineProperty(message.author, 'bot', { value: true });

      return dispatcher.handleMessage(message)
        .then(() => {
          expect(command.run).not.toHaveBeenCalled();
        });
    });

    it('should not run the command if message does not start with prefix.', () => {
      message.content = 'hello';

      return dispatcher.handleMessage(message)
        .then(() => {
          expect(command.run).not.toHaveBeenCalled();
        });
    });

    it('should not run the command if no command was found in registry.', () => {
      registryGetCommandSpy.mockReturnValueOnce(null);

      return dispatcher.handleMessage(message)
        .then(() => {
          expect(command.run).not.toHaveBeenCalled();
        });
    });

    it('should not run the command if command is guild only and message was not sent in a guild.', () => {
      command.guildOnly = true;
      Object.defineProperty(message, 'guild', { value: null });

      return dispatcher.handleMessage(message)
        .then(() => {
          expect(command.run).not.toHaveBeenCalled();
        });
    });

    it('should reply if the user does not have enough permissions.', () => {
      jest.spyOn(command, 'hasPermission').mockReturnValue('Oops...');

      return dispatcher.handleMessage(message)
        .then(() => {
          expect(message.reply).toHaveBeenCalledWith('Oops...');
        });
    });

    it('should info log command execution.', () => {
      return dispatcher.handleMessage(message)
        .then(() => {
          expect(mockedLogger.info).toHaveBeenCalledTimes(1);
        });
    });

    it('should run the command if all is correct.', () => {
      return dispatcher.handleMessage(message)
        .then(() => {
          expect(command.run).toHaveBeenCalled();
        });
    });

    it('should handle errors if the command throws inside run.', () => {
      const expectedError = new Error('oops');
      const runSpy = command.run as jest.Mock<any, any>;
      runSpy.mockImplementation(() => {
        throw expectedError;
      });

      return dispatcher.handleMessage(message)
        .then(() => {
          expect(command.onError).toHaveBeenCalledWith(expectedError, message);
        });
    });
  });
});