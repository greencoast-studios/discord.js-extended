import { ChatInputCommandInteraction, Guild } from 'discord.js';
import SetLocaleSlashCommand from '../../../../../src/classes/command/default/slash/SetLocaleSlashCommand';
import ExtendedClient from '../../../../../src/classes/ExtendedClient';
import GuildLocalizer from '../../../../../src/classes/locale/GuildLocalizer';
import { InteractionMock, GuildMock } from '../../../../../__mocks__/discordMocks';
import { mockedLocaleStrings } from '../../../../../__mocks__/locale';

describe('Classes: Command: Default: Slash: SetLocaleSlashCommand', () => {
  let command: SetLocaleSlashCommand;

  let clientMock: ExtendedClient;
  let interactionMock: ChatInputCommandInteraction;
  let guildMock: Guild;
  let guildLocalizerMock: GuildLocalizer;

  beforeEach(() => {
    clientMock = new ExtendedClient({ intents: [], localizer: { defaultLocale: 'en', localeStrings: mockedLocaleStrings } });
    interactionMock = new InteractionMock() as unknown as ChatInputCommandInteraction;

    guildMock = new GuildMock() as Guild;
    guildLocalizerMock = new GuildLocalizer(clientMock.localizer!, guildMock);

    command = new SetLocaleSlashCommand(clientMock);
  });

  describe('run()', () => {
    it('should update the locale for that guild.', () => {
      const getStringSpy = interactionMock.options.getString as jest.Mock;
      getStringSpy.mockReturnValue('fr');
      jest.spyOn(clientMock.localizer!, 'getLocalizer').mockReturnValue(guildLocalizerMock);

      expect(guildLocalizerMock.locale).toBe('en');
      return command.run(interactionMock)
        .then(() => {
          expect(guildLocalizerMock.locale).toBe('fr');
        });
    });

    it('should not update the locale if the same one is already set.', () => {
      const getStringSpy = interactionMock.options.getString as jest.Mock;
      getStringSpy.mockReturnValue('en');
      jest.spyOn(clientMock.localizer!, 'getLocalizer').mockReturnValue(guildLocalizerMock);

      expect(guildLocalizerMock.locale).toBe('en');
      return command.run(interactionMock)
        .then(() => {
          const updateSpy = jest.spyOn(guildLocalizerMock, 'updateLocale');
          expect(updateSpy).not.toHaveBeenCalled();
        });
    });

    it('should reply if the new locale is the same as previous.', () => {
      const getStringSpy = interactionMock.options.getString as jest.Mock;
      getStringSpy.mockReturnValue('en');
      jest.spyOn(clientMock.localizer!, 'getLocalizer').mockReturnValue(guildLocalizerMock);

      return command.run(interactionMock)
        .then(() => {
          const replySpy = interactionMock.reply as jest.Mock;
          expect(replySpy.mock.calls[0][0]).toContain('already set');
        });
    });

    it('should reply that the locale has been updated.', () => {
      const getStringSpy = interactionMock.options.getString as jest.Mock;
      getStringSpy.mockReturnValue('fr');
      jest.spyOn(clientMock.localizer!, 'getLocalizer').mockReturnValue(guildLocalizerMock);

      return command.run(interactionMock)
        .then(() => {
          const replySpy = interactionMock.reply as jest.Mock;
          expect(replySpy.mock.calls[0][0]).toContain('fr');
        });
    });
  });
});
