import { HelpSlashCommand } from '../../../../../src/classes/command/default';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { ExtendedClient } from '../../../../../src';
import { InteractionMock } from '../../../../../__mocks__/local/discordMocks';

const clientMock = new ExtendedClient();
const interactionMock = new InteractionMock() as unknown as ChatInputCommandInteraction;

describe('Classes: Command: Default: Slash: HelpSlashCommand', () => {
  let command: HelpSlashCommand;

  beforeEach(() => {
    command = new HelpSlashCommand(clientMock);
  });

  describe('prepareFields()', () => {
    it('should return an array of objects with the commands information by group.', () => {
      clientMock.registry.registerGroup('misc', 'Misc');
      clientMock.registry.registerCommand(command);

      const result = command.prepareFields();

      expect(result).toEqual([{
        name: 'Misc',
        value: `${command.emoji} **/${command.name}** - ${command.description}\n`,
        inline: false
      }]);
    });
  });

  describe('run()', () => {
    it('should send an embed.', () => {
      const sendSpy = interactionMock.reply as jest.Mock;

      return command.run(interactionMock)
        .then(() => {
          expect(sendSpy).toHaveBeenCalledTimes(1);
          expect(sendSpy.mock.calls[0][0].embeds[0]).toBeInstanceOf(EmbedBuilder);
        });
    });
  });
});
