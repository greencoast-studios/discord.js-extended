import Discord from 'discord.js';
import HelpRegularCommand from '../../../../../src/classes/command/default/regular/HelpRegularCommand';
import ExtendedClient from '../../../../../src/classes/ExtendedClient';
import { MessageMock } from '../../../../../__mocks__/discordMocks';

const clientMock = new ExtendedClient({ prefix: '!', intents: [] });
const messageMock = new MessageMock() as unknown as Discord.Message;

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
        title: 'Misc',
        text: `${command.emoji} **${clientMock.prefix}${command.name}** - ${command.description}\n`
      }]);
    });
  });

  describe('run()', () => {
    it('should send an embed.', () => {
      const sendSpy = messageMock.channel.send as jest.Mock;

      return command.run(messageMock)
        .then(() => {
          expect(sendSpy).toHaveBeenCalledTimes(1);
          expect(sendSpy.mock.calls[0][0].embeds[0]).toBeInstanceOf(Discord.MessageEmbed);
        });
    });
  });
});
