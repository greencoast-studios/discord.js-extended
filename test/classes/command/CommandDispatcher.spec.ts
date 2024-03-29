import { MessageMock, InteractionMock, mockDiscordJs } from '../../../__mocks__/local/discordMocks';
mockDiscordJs();

import { CommandDispatcher, CommandRegistry, ExtendedClient, RegularCommand, SlashCommand } from '../../../src';
import { Message, Interaction, ChatInputCommandInteraction } from 'discord.js';
import { ConcreteRegularCommand, ConcreteSlashCommand } from '../../../__mocks__/local/command';

const clientMock = new ExtendedClient({ prefix: '!', intents: [] });

describe('Classes: Command: CommandDispatcher', () => {
  let dispatcher: CommandDispatcher;
  let registry: CommandRegistry;
  let registryGetCommandSpy: jest.SpyInstance;
  let regularCommand: RegularCommand;
  let slashCommand: SlashCommand;
  let message: Message;
  let interaction: Interaction;

  beforeEach(() => {
    regularCommand = new ConcreteRegularCommand(clientMock);
    regularCommand.run = jest.fn();
    regularCommand.onError = jest.fn();

    slashCommand = new ConcreteSlashCommand(clientMock);
    slashCommand.run = jest.fn();
    slashCommand.onError = jest.fn();

    registry = new CommandRegistry(clientMock);
    dispatcher = new CommandDispatcher(clientMock, registry);

    message = new MessageMock() as unknown as Message;
    message.content = '!command';

    interaction = new InteractionMock() as unknown as Interaction;
    const isChatInputCommandSpy = interaction.isChatInputCommand as jest.Mock;
    isChatInputCommandSpy.mockReturnValue(true);
  });

  describe('handleMessage()', () => {
    beforeEach(() => {
      registryGetCommandSpy = jest.spyOn(registry.commands, 'get').mockReturnValue(regularCommand);
    });

    it('should not run the command if the message is a partial.', () => {
      Object.defineProperty(message, 'partial', { value: true });

      return dispatcher.handleMessage(message)
        .then(() => {
          expect(regularCommand.run).not.toHaveBeenCalled();
        });
    });

    it('should not run the command if the message comes from a bot.', () => {
      Object.defineProperty(message.author, 'bot', { value: true });

      return dispatcher.handleMessage(message)
        .then(() => {
          expect(regularCommand.run).not.toHaveBeenCalled();
        });
    });

    it('should not run the command if message does not start with prefix.', () => {
      message.content = 'hello';

      return dispatcher.handleMessage(message)
        .then(() => {
          expect(regularCommand.run).not.toHaveBeenCalled();
        });
    });

    it('should not run the command if no command was found in registry.', () => {
      registryGetCommandSpy.mockReturnValueOnce(null);

      return dispatcher.handleMessage(message)
        .then(() => {
          expect(regularCommand.run).not.toHaveBeenCalled();
        });
    });

    it('should not run the command if the command is not of instance RegularCommand.', () => {
      registryGetCommandSpy.mockReturnValueOnce(slashCommand);

      return dispatcher.handleMessage(message)
        .then(() => {
          expect(slashCommand.run).not.toHaveBeenCalled();
        });
    });

    it('should not run the command if command is guild only and message was not sent in a guild.', () => {
      Object.defineProperty(regularCommand, 'guildOnly', { value: true });
      Object.defineProperty(message, 'guild', { value: null });

      return dispatcher.handleMessage(message)
        .then(() => {
          expect(regularCommand.run).not.toHaveBeenCalled();
        });
    });

    it('should reply if the user does not have enough permissions.', () => {
      jest.spyOn(regularCommand, 'hasPermission').mockReturnValue('Oops...');

      return dispatcher.handleMessage(message)
        .then(() => {
          expect(message.reply).toHaveBeenCalledWith('Oops...');
        });
    });

    it('should emit commandExecute event.', () => {
      return dispatcher.handleMessage(message)
        .then(() => {
          expect(clientMock.emit).toHaveBeenCalledWith('commandExecute', regularCommand, message);
        });
    });

    it('should run the command if all is correct.', () => {
      return dispatcher.handleMessage(message)
        .then(() => {
          expect(regularCommand.run).toHaveBeenCalled();
        });
    });

    it('should handle errors if the command throws inside run.', () => {
      const expectedError = new Error('oops');
      const runSpy = regularCommand.run as jest.Mock;
      runSpy.mockImplementation(() => {
        throw expectedError;
      });

      return dispatcher.handleMessage(message)
        .then(() => {
          expect(regularCommand.onError).toHaveBeenCalledWith(expectedError, message);
        });
    });

    it('should not execute NSFW command in a non NSFW channel.', () => {
      Object.defineProperty(message.channel, 'nsfw', { value: false });
      Object.defineProperty(regularCommand, 'nsfw', { value: true });

      return dispatcher.handleMessage(message)
        .then(() => {
          expect(regularCommand.run).not.toHaveBeenCalled();
        });
    });

    it('should reply that the NSFW command may not be executed in a non NSFW channel.', () => {
      Object.defineProperty(message.channel, 'nsfw', { value: false });
      Object.defineProperty(regularCommand, 'nsfw', { value: true });

      return dispatcher.handleMessage(message)
        .then(() => {
          expect(message.reply).toHaveBeenCalledTimes(1);
          expect(message.reply).toHaveBeenCalledWith('This command may only be used in a NSFW channel.');
        });
    });

    it('should execute the NSFW command in a NSFW channel.', () => {
      Object.defineProperty(message.channel, 'nsfw', { value: true });
      Object.defineProperty(regularCommand, 'nsfw', { value: true });

      return dispatcher.handleMessage(message)
        .then(() => {
          expect(regularCommand.run).toHaveBeenCalled();
        });
    });
  });

  describe('handleInteraction()', () => {
    beforeEach(() => {
      registryGetCommandSpy = jest.spyOn(registry.commands, 'get').mockReturnValue(slashCommand);
    });

    it('should not run command if interaction is not a CommandInteraction.', () => {
      const isChatInputCommandSpy = interaction.isChatInputCommand as jest.Mock;
      isChatInputCommandSpy.mockReturnValue(false);

      return dispatcher.handleInteraction(interaction)
        .then(() => {
          expect(slashCommand.run).not.toHaveBeenCalled();
        });
    });

    it('should not run the command if no command was found in registry.', () => {
      registryGetCommandSpy.mockReturnValueOnce(null);

      return dispatcher.handleInteraction(interaction)
        .then(() => {
          expect(slashCommand.run).not.toHaveBeenCalled();
        });
    });

    it('should not run the command if the command is not of instance SlashCommand.', () => {
      registryGetCommandSpy.mockReturnValueOnce(regularCommand);

      return dispatcher.handleInteraction(interaction)
        .then(() => {
          expect(regularCommand.run).not.toHaveBeenCalled();
        });
    });

    it('should not run the command if command is guild only and interaction was not sent in a guild.', () => {
      Object.defineProperty(slashCommand, 'guildOnly', { value: true });
      const inGuildSpy = interaction.inGuild as jest.Mock;
      inGuildSpy.mockReturnValue(false);

      return dispatcher.handleInteraction(interaction)
        .then(() => {
          expect(slashCommand.run).not.toHaveBeenCalled();
        });
    });

    it('should reply if the user does not have enough permissions.', () => {
      jest.spyOn(slashCommand, 'hasPermission').mockReturnValue('Oops...');

      return dispatcher.handleInteraction(interaction)
        .then(() => {
          const commandInteraction = interaction as ChatInputCommandInteraction;
          expect(commandInteraction.reply).toHaveBeenCalledWith('Oops...');
        });
    });

    it('should emit commandExecute event.', () => {
      return dispatcher.handleInteraction(interaction)
        .then(() => {
          expect(clientMock.emit).toHaveBeenCalledWith('commandExecute', slashCommand, interaction);
        });
    });

    it('should run the command if all is correct.', () => {
      return dispatcher.handleInteraction(interaction)
        .then(() => {
          expect(slashCommand.run).toHaveBeenCalled();
        });
    });

    it('should handle errors if the command throws inside run.', () => {
      const expectedError = new Error('oops');
      const runSpy = slashCommand.run as jest.Mock;
      runSpy.mockImplementation(() => {
        throw expectedError;
      });

      return dispatcher.handleInteraction(interaction)
        .then(() => {
          expect(slashCommand.onError).toHaveBeenCalledWith(expectedError, interaction);
        });
    });

    it('should not execute NSFW command in a non NSFW channel.', () => {
      Object.defineProperty(interaction.channel, 'nsfw', { value: false });
      Object.defineProperty(slashCommand, 'nsfw', { value: true });

      return dispatcher.handleInteraction(interaction)
        .then(() => {
          expect(slashCommand.run).not.toHaveBeenCalled();
        });
    });

    it('should reply that the NSFW command may not be executed in a non NSFW channel.', () => {
      Object.defineProperty(interaction.channel, 'nsfw', { value: false });
      Object.defineProperty(slashCommand, 'nsfw', { value: true });

      return dispatcher.handleInteraction(interaction)
        .then(() => {
          const commandInteraction = interaction as ChatInputCommandInteraction;
          expect(commandInteraction.reply).toHaveBeenCalledTimes(1);
          expect(commandInteraction.reply).toHaveBeenCalledWith('This command may only be used in a NSFW channel.');
        });
    });

    it('should execute the NSFW command in a NSFW channel.', () => {
      Object.defineProperty(interaction.channel, 'nsfw', { value: true });
      Object.defineProperty(slashCommand, 'nsfw', { value: true });

      return dispatcher.handleInteraction(interaction)
        .then(() => {
          expect(slashCommand.run).toHaveBeenCalled();
        });
    });
  });
});
