import { Message, Guild, IntentsBitField } from 'discord.js';
import SetLocaleRegularCommand from '../../../../../src/classes/command/default/regular/SetLocaleRegularCommand';
import ExtendedClient from '../../../../../src/classes/ExtendedClient';
import GuildLocalizer from '../../../../../src/classes/locale/GuildLocalizer';
import { MessageMock, GuildMock } from '../../../../../__mocks__/discordMocks';
import { mockedLocaleStrings } from '../../../../../__mocks__/locale';

describe('Classes: Command: Default: Regular: SetLocaleRegularCommand', () => {
  let command: SetLocaleRegularCommand;

  let clientMock: ExtendedClient;
  let messageMock: Message;
  let guildMock: Guild;
  let guildLocalizerMock: GuildLocalizer;

  beforeEach(() => {
    clientMock = new ExtendedClient({ prefix: '!', intents: new IntentsBitField(), localizer: { defaultLocale: 'en', localeStrings: mockedLocaleStrings } });
    messageMock = new MessageMock() as unknown as Message;

    guildMock = new GuildMock() as Guild;
    guildLocalizerMock = new GuildLocalizer(clientMock.localizer!, guildMock);

    command = new SetLocaleRegularCommand(clientMock);
  });

  describe('run()', () => {
    it('should reply if no locale is supplied.', () => {
      messageMock.content = '!set_locale';
      jest.spyOn(clientMock.localizer!, 'getLocalizer').mockReturnValue(guildLocalizerMock);

      return command.run(messageMock, [])
        .then(() => {
          const replySpy = messageMock.reply as jest.Mock;
          expect(replySpy.mock.calls[0][0]).toContain('need to specify');
        });
    });

    it('should update the locale for that guild.', () => {
      messageMock.content = '!set_locale fr';
      jest.spyOn(clientMock.localizer!, 'getLocalizer').mockReturnValue(guildLocalizerMock);

      expect(guildLocalizerMock.locale).toBe('en');
      return command.run(messageMock, ['fr'])
        .then(() => {
          expect(guildLocalizerMock.locale).toBe('fr');
        });
    });

    it('should not update the locale if the same one is already set.', () => {
      messageMock.content = '!set_locale en';
      jest.spyOn(clientMock.localizer!, 'getLocalizer').mockReturnValue(guildLocalizerMock);

      expect(guildLocalizerMock.locale).toBe('en');
      return command.run(messageMock, ['en'])
        .then(() => {
          const updateSpy = jest.spyOn(guildLocalizerMock, 'updateLocale');
          expect(updateSpy).not.toHaveBeenCalled();
        });
    });

    it('should reply if the new locale is the same as previous.', () => {
      messageMock.content = '!set_locale en';
      jest.spyOn(clientMock.localizer!, 'getLocalizer').mockReturnValue(guildLocalizerMock);

      return command.run(messageMock, ['en'])
        .then(() => {
          const replySpy = messageMock.reply as jest.Mock;
          expect(replySpy.mock.calls[0][0]).toContain('already set');
        });
    });

    it('should reply that the locale has been updated.', () => {
      messageMock.content = '!set_locale fr';
      jest.spyOn(clientMock.localizer!, 'getLocalizer').mockReturnValue(guildLocalizerMock);

      return command.run(messageMock, ['fr'])
        .then(() => {
          const replySpy = messageMock.reply as jest.Mock;
          expect(replySpy.mock.calls[0][0]).toContain('fr');
        });
    });
  });
});
