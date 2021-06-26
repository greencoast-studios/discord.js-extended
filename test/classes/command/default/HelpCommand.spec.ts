/* eslint-disable @typescript-eslint/no-explicit-any */
import Discord from 'discord.js';
import HelpCommand from '../../../../src/classes/command/default/HelpCommand';
import ExtendedClient from '../../../../src/classes/ExtendedClient';

const clientMock = new ExtendedClient({ prefix: '!' });
const messageMock = new Discord.Message(clientMock, {}, new Discord.TextChannel(new Discord.Guild(clientMock, {}), {}));

describe('Classes: Command: Default: HelpCommand', () => {
  let command: HelpCommand;

  beforeEach(() => {
    command = new HelpCommand(clientMock);
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
      const sendSpy = messageMock.channel.send as jest.Mock<any, any>;
      
      return command.run(messageMock)
        .then(() => {
          expect(sendSpy).toHaveBeenCalledTimes(1);
          expect(sendSpy.mock.calls[0][0]).toBeInstanceOf(Discord.MessageEmbed);
        });
    });
  });
});
