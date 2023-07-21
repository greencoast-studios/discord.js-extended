import Discord from 'discord.js';
import RegularCommand from '../../../src/classes/command/RegularCommand';
import ExtendedClient from '../../../src/classes/ExtendedClient';
import { ConcreteRegularCommand } from '../../../__mocks__/command';
import { MessageMock, UserMock } from '../../../__mocks__/discordMocks';

jest.mock('discord.js');

const userMock = new UserMock() as unknown as Discord.User;

describe('Classes: Command: RegularCommand', () => {
  let client: ExtendedClient;
  let command: RegularCommand;
  let message: Discord.Message;

  beforeEach(() => {
    client = new ExtendedClient();
    command = new ConcreteRegularCommand(client);
    message = new MessageMock() as unknown as Discord.Message;
  });

  describe('hasPermission()', () => {
    it('should return true if command is not ownerOnly and it does not require userPermissions.', () => {
      command = new ConcreteRegularCommand(client, { ownerOnly: false, userPermissions: null });

      expect(command.hasPermission(message)).toBe(true);
    });

    it('should return true if the ownerOverride is enabled and the author is the owner.', () => {
      jest.spyOn(client, 'isOwner').mockReturnValue(true);
      command = new ConcreteRegularCommand(client, { ownerOverride: true, userPermissions: 'YES' });

      expect(command.hasPermission(message)).toBe(true);
    });

    it('should return a owner only message if the command is ownerOnly and author is not the owner.', () => {
      jest.spyOn(client, 'isOwner').mockReturnValue(false);
      command = new ConcreteRegularCommand(client, { ownerOnly: true });

      expect(command.hasPermission(message)).toBe(`The command ${command.name} may only be used by the bot's owner.`);
    });

    it('should return true if userPermissions is provided and author has all permissions.', () => {
      const channel = message.channel as any;
      channel.permissionsFor().missing.mockReturnValue([]);
      command = new ConcreteRegularCommand(client, { userPermissions: 'YES' });

      expect(command.hasPermission(message)).toBe(true);
    });

    it('should return true if channel is not text based (absurd).', () => {
      const channel = message.channel as any;
      channel.permissionsFor().missing.mockReturnValue(['dont matter']);
      (channel.isText as jest.Mock).mockReturnValue(false);
      command = new ConcreteRegularCommand(client, { userPermissions: 'YES' });

      expect(command.hasPermission(message)).toBe(true);
    });

    it('should return a permission required message if the command has userPermissions and author does not have only one.', () => {
      const channel = message.channel as any;
      channel.permissionsFor().missing.mockReturnValue(['123']);
      command = new ConcreteRegularCommand(client, { userPermissions: 'YES' });

      expect((command.hasPermission(message) as string).endsWith('permission.')).toBe(true);
    });

    it('should return a permissions required message if the command has userPermissions and author does not have multiple.', () => {
      const channel = message.channel as any;
      channel.permissionsFor().missing.mockReturnValue(['123', '456']);
      command = new ConcreteRegularCommand(client, { userPermissions: 'YES' });

      expect((command.hasPermission(message) as string).endsWith('permissions.')).toBe(true);
    });

    it('should return true if command has no required userPermissions and is not ownerOnly.', () => {
      command = new ConcreteRegularCommand(client);

      expect(command.hasPermission(message)).toBe(true);
    });
  });

  describe('onError()', () => {
    it('should emit a commandError event.', () => {
      const expectedError = new Error('oops');
      command.onError(expectedError, message);

      expect(client.emit).toHaveBeenCalledWith('commandError', expectedError, command, message);
    });

    it('should reply with the correct message if no owner is set on the client.', () => {
      client = new ExtendedClient();
      command = new ConcreteRegularCommand(client);

      command.onError(new Error(), message);

      expect(message.reply).toHaveBeenCalledTimes(1);
      expect((message.reply as jest.Mock).mock.calls[0][0].endsWith(`the command ${command.name}.`)).toBe(true);
    });

    it('should reply with the correct message if an owner is set on the client.', () => {
      client = new ExtendedClient({ owner: '123', intents: [] });
      (client.users.cache.get as jest.Mock).mockReturnValue(userMock);
      command = new ConcreteRegularCommand(client);

      command.onError(new Error(), message);

      expect(message.reply).toHaveBeenCalledTimes(1);
      expect((message.reply as jest.Mock).mock.calls[0][0].endsWith('contact User.')).toBe(true);
    });

    it('should send the error to the owner if errorReporting is enabled.', () => {
      client = new ExtendedClient({ owner: '123', errorOwnerReporting: true, intents: [] });
      (client.users.cache.get as jest.Mock).mockReturnValue(userMock);
      command = new ConcreteRegularCommand(client);

      command.onError(new Error(), message);

      expect(client.owner!.send).toHaveBeenCalledTimes(1);
    });
  });
});
