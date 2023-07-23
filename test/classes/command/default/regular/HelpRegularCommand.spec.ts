import { HelpRegularCommand } from '../../../../../src/classes/command/default';
import { Message, EmbedBuilder } from 'discord.js';
import { ExtendedClient } from '../../../../../src';
import { MessageMock } from '../../../../../__mocks__/local/discordMocks';

const clientMock = new ExtendedClient({ prefix: '!', intents: [] });
const messageMock = new MessageMock() as unknown as Message;

describe('Classes: Command: Default: Regular: HelpRegularCommand', () => {
  let command: HelpRegularCommand;

  beforeEach(() => {
    command = new HelpRegularCommand(clientMock);
  });

  describe('prepareFields()', () => {
    it('should return an array of objects with the commands information by group.', () => {
      clientMock.registry.registerGroup('misc', 'Misc');
      clientMock.registry.registerCommand(command);

      const result = command.prepareFields();

      expect(result).toEqual([{
        name: 'Misc',
        value: `${command.emoji} **${clientMock.prefix}${command.name}** - ${command.description}\n`,
        inline: false
      }]);
    });
  });

  describe('run()', () => {
    it('should send an embed.', () => {
      const sendSpy = messageMock.channel.send as jest.Mock;

      return command.run(messageMock)
        .then(() => {
          expect(sendSpy).toHaveBeenCalledTimes(1);
          expect(sendSpy.mock.calls[0][0].embeds[0]).toBeInstanceOf(EmbedBuilder);
        });
    });
  });
});
