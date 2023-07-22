import { User, ChatInputCommandInteraction, IntentsBitField } from 'discord.js';
import SlashCommand from '../../../src/classes/command/SlashCommand';
import ExtendedClient from '../../../src/classes/ExtendedClient';
import { ConcreteSlashCommand } from '../../../__mocks__/command';
import { InteractionMock, UserMock } from '../../../__mocks__/discordMocks';

jest.mock('discord.js');

const userMock = new UserMock() as unknown as User;

describe('Classes: Command: SlashCommand', () => {
  let client: ExtendedClient;
  let command: SlashCommand;
  let interaction: ChatInputCommandInteraction;

  beforeEach(() => {
    client = new ExtendedClient();
    command = new ConcreteSlashCommand(client);
    interaction = new InteractionMock() as unknown as ChatInputCommandInteraction;
  });

  describe('constructor', () => {
    it('should throw if command name is too short or too long.', () => {
      expect(() => {
        command = new ConcreteSlashCommand(client, { name: '' });
      }).toThrow();
      expect(() => {
        command = new ConcreteSlashCommand(client, { name: '8129730128371298361290836712093812721903871203987' });
      }).toThrow();
    });

    it('should throw if name contains upper-cased characters.', () => {
      expect(() => {
        command = new ConcreteSlashCommand(client, { name: 'SlashCommand' });
      }).toThrow();
    });

    it('should throw if description is too short or too long.', () => {
      expect(() => {
        command = new ConcreteSlashCommand(client, { description: '' });
      }).toThrow();
      expect(() => {
        command = new ConcreteSlashCommand(client, { description: '812973012012732109321093712093127039127312093721093127031297310973120738371298361290836712093812721903871203987' });
      }).toThrow();
    });

    it('should throw if any of the aliases is too short or too long.', () => {
      expect(() => {
        command = new ConcreteSlashCommand(client, { aliases: [''] });
      }).toThrow();
      expect(() => {
        command = new ConcreteSlashCommand(client, { aliases: ['8129730128371298361290836712093812721903871203987'] });
      }).toThrow();
    });

    it('should throw if any of the aliases contains upper-cased characters.', () => {
      expect(() => {
        command = new ConcreteSlashCommand(client, { aliases: ['SlashCommand'] });
      }).toThrow();
    });

    it('should not throw if command info is correct.', () => {
      expect(() => {
        command = new ConcreteSlashCommand(client, { name: 'name', description: 'Description.', aliases: ['cmd1'] });
      }).not.toThrow();
    });
  });

  describe('getDataBuilder()', () => {
    it("should return the command's data builder.", () => {
      expect(command.getDataBuilder()).toBe(command.dataBuilder);
    });
  });

  describe('getAllDataBuilders()', () => {
    it("should return all the command's data builders.", () => {
      command = new ConcreteSlashCommand(client, { name: 'name', aliases: ['cmd1', 'cmd2', 'cmd3'] });
      const builders = command.getAllDataBuilders();
      const mappedBuilderNames = builders.map((builder) => builder.name);

      expect(mappedBuilderNames).toContain(command.name);
      command.aliases.forEach((alias) => {
        expect(mappedBuilderNames).toContain(alias);
      });
    });
  });

  describe('hasPermission()', () => {
    it('should return true if command is not ownerOnly and it does not require userPermissions.', () => {
      command = new ConcreteSlashCommand(client, { ownerOnly: false, userPermissions: null });

      expect(command.hasPermission(interaction)).toBe(true);
    });

    it('should return true if the ownerOverride is enabled and the author is the owner.', () => {
      jest.spyOn(client, 'isOwner').mockReturnValue(true);
      command = new ConcreteSlashCommand(client, { ownerOverride: true, userPermissions: 'YES' });

      expect(command.hasPermission(interaction)).toBe(true);
    });

    it('should return a owner only message if the command is ownerOnly and author is not the owner.', () => {
      jest.spyOn(client, 'isOwner').mockReturnValue(false);
      command = new ConcreteSlashCommand(client, { ownerOnly: true });

      expect(command.hasPermission(interaction)).toBe(`The command ${command.name} may only be used by the bot's owner.`);
    });

    it('should return true if userPermissions is provided and author has all permissions.', () => {
      const channel = interaction.channel as any;
      channel.permissionsFor().missing.mockReturnValue([]);
      command = new ConcreteSlashCommand(client, { userPermissions: 'YES' });

      expect(command.hasPermission(interaction)).toBe(true);
    });

    it('should return a permission required message if the command has userPermissions and author does not have only one.', () => {
      const channel = interaction.channel as any;
      channel.permissionsFor().missing.mockReturnValue(['123']);
      command = new ConcreteSlashCommand(client, { userPermissions: 'YES' });

      expect((command.hasPermission(interaction) as string).endsWith('permission.')).toBe(true);
    });

    it('should return a permissions required message if the command has userPermissions and author does not have multiple.', () => {
      const channel = interaction.channel as any;
      channel.permissionsFor().missing.mockReturnValue(['123', '456']);
      command = new ConcreteSlashCommand(client, { userPermissions: 'YES' });

      expect((command.hasPermission(interaction) as string).endsWith('permissions.')).toBe(true);
    });

    it('should return true if command has no required userPermissions and is not ownerOnly.', () => {
      command = new ConcreteSlashCommand(client);

      expect(command.hasPermission(interaction)).toBe(true);
    });
  });

  describe('onError()', () => {
    it('should emit a commandError event.', async () => {
      const expectedError = new Error('oops');
      await command.onError(expectedError, interaction);

      expect(client.emit).toHaveBeenCalledWith('commandError', expectedError, command, interaction);
    });

    it('should reply with the correct message if no owner is set on the client.', async () => {
      client = new ExtendedClient();
      command = new ConcreteSlashCommand(client);

      await command.onError(new Error(), interaction);

      const commandInteraction = interaction as ChatInputCommandInteraction;
      expect(commandInteraction.reply).toHaveBeenCalledTimes(1);
      expect((commandInteraction.reply as jest.Mock).mock.calls[0][0].content.endsWith(`the command ${command.name}.`)).toBe(true);
    });

    it('should reply with the correct message if an owner is set on the client.', async () => {
      client = new ExtendedClient({ owner: '123', intents: new IntentsBitField() });
      (client.users.cache.get as jest.Mock).mockReturnValue(userMock);
      command = new ConcreteSlashCommand(client);

      await command.onError(new Error(), interaction);

      const commandInteraction = interaction as ChatInputCommandInteraction;
      expect(commandInteraction.reply).toHaveBeenCalledTimes(1);
      expect((commandInteraction.reply as jest.Mock).mock.calls[0][0].content.endsWith('contact User.')).toBe(true);
    });

    it('should send the error to the owner if errorReporting is enabled.', async () => {
      client = new ExtendedClient({ owner: '123', errorOwnerReporting: true, intents: new IntentsBitField() });
      (client.users.cache.get as jest.Mock).mockReturnValue(userMock);
      command = new ConcreteSlashCommand(client);

      await command.onError(new Error(), interaction);

      expect(client.owner!.send).toHaveBeenCalledTimes(1);
    });

    it('should editReply if the interaction has been already replied.', async () => {
      client = new ExtendedClient();
      command = new ConcreteSlashCommand(client);
      interaction.replied = true;

      await command.onError(new Error(), interaction);

      const commandInteraction = interaction as ChatInputCommandInteraction;

      expect(commandInteraction.editReply).toHaveBeenCalledTimes(1);
      expect((commandInteraction.editReply as jest.Mock).mock.calls[0][0].content.endsWith(`the command ${command.name}.`)).toBe(true);
    });

    it('should editReply if the interaction has been already deferred.', async () => {
      client = new ExtendedClient();
      command = new ConcreteSlashCommand(client);
      interaction.deferred = true;

      await command.onError(new Error(), interaction);

      const commandInteraction = interaction as ChatInputCommandInteraction;

      expect(commandInteraction.editReply).toHaveBeenCalledTimes(1);
      expect((commandInteraction.editReply as jest.Mock).mock.calls[0][0].content.endsWith(`the command ${command.name}.`)).toBe(true);
    });
  });
});
