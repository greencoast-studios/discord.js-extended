/* eslint-disable @typescript-eslint/no-explicit-any */
import Discord from 'discord.js';
import CommandDispatcher from '../../../src/classes/command/CommandDispatcher';
import CommandRegistry from '../../../src/classes/command/CommandRegistry';
import ExtendedClient from '../../../src/classes/ExtendedClient';
import Command from '../../../src/classes/command/Command';
import ConcreteCommand from '../../../__mocks__/command';
import { MessageMock } from '../../../__mocks__/discordMocks';

jest.mock('discord.js');

const clientMock = new ExtendedClient({ prefix: '!', intents: [] });

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
    message = new MessageMock() as unknown as Discord.Message;
    message.content = '!command';
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

    it('should emit commandExecute event.', () => {
      return dispatcher.handleMessage(message)
        .then(() => {
          expect(clientMock.emit).toHaveBeenCalledWith('commandExecute', command, message);
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

    it('should not execute NSFW command in a non NSFW channel.', () => {
      Object.defineProperty(message.channel, 'nsfw', { value: false });
      command.nsfw = true;

      return dispatcher.handleMessage(message)
        .then(() => {
          expect(command.run).not.toHaveBeenCalled();
        });
    });

    it('should reply that the NSFW command may not be executed in a non NSFW channel.', () => {
      Object.defineProperty(message.channel, 'nsfw', { value: false });
      command.nsfw = true;

      return dispatcher.handleMessage(message)
        .then(() => {
          expect(message.reply).toHaveBeenCalledTimes(1);
          expect(message.reply).toHaveBeenCalledWith('This command may only be used in a NSFW channel.');
        });
    });

    it('should execute the NSFW command in a NSFW channel.', () => {
      Object.defineProperty(message.channel, 'nsfw', { value: true });
      command.nsfw = true;

      return dispatcher.handleMessage(message)
        .then(() => {
          expect(command.run).toHaveBeenCalled();
        });
    });
  });
});
