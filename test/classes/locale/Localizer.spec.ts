import Discord from 'discord.js';
import Localizer from '../../../src/classes/locale/Localizer';
import GuildLocalizer from '../../../src/classes/locale/GuildLocalizer';
import ExtendedClient from '../../../src/classes/ExtendedClient';
import { mockedLocaleStrings } from '../../../__mocks__/locale';
import { GuildMock } from '../../../__mocks__/discordMocks';

jest.mock('discord.js');

const clientMock = new ExtendedClient();
const guildMock = new GuildMock() as Discord.Guild;

describe('Classes: Locale: Localizer', () => {
  let localizer: Localizer;

  beforeEach(() => {
    localizer = new Localizer(clientMock, { defaultLocale: 'en', localeStrings: mockedLocaleStrings });
  });

  describe('init()', () => {
    it('should populate guildLocalizers with their respective localizers.', () => {
      return localizer.init()
        .then(() => {
          expect(localizer.guildLocalizers.size).toBe(3);
          expect(localizer.guildLocalizers.each((l) => l instanceof GuildLocalizer));
        });
    });

    it('should resolve the locales of each guild localizer.', () => {
      return localizer.init()
        .then((locales) => {
          expect(locales).toStrictEqual(['en', 'en', 'en']);
        });
    });
  });

  describe('getLocalizer()', () => {
    it("should return the specified guild's localizer.", () => {
      const guildLocalizer = new GuildLocalizer(localizer, guildMock);
      localizer.guildLocalizers.set(guildMock.id, guildLocalizer);

      expect(localizer.getLocalizer(guildMock)).toBe(guildLocalizer);
    });
  });

  describe('getAvailableLocales()', () => {
    it('should return the available locales.', () => {
      const locales = localizer.getAvailableLocales();
      expect(locales).toContain('en');
      expect(locales).toContain('es');
      expect(locales).toContain('fr');
    });
  });

  describe('translate()', () => {
    it('should throw if given an invalid locale.', () => {
      expect(() => {
        localizer.translate('message.test.hello', 'unknown');
      }).toThrow();
    });

    it('should throw if given an invalid message key.', () => {
      expect(() => {
        localizer.translate('unknown', 'en');
      }).toThrow();
    });

    it('should return the message string translated.', () => {
      const english = localizer.translate('message.test.hello', 'en');
      const spanish = localizer.translate('message.test.hello', 'es');
      const french = localizer.translate('message.test.hello', 'fr');

      expect(english).toBe('Hello');
      expect(spanish).toBe('Hola');
      expect(french).toBe('Bonjour');
    });

    it('should use the default locale if no locale is given.', () => {
      const translated1 = localizer.translate('message.test.bye');
      const translated2 = localizer.translate('message.test.bye', null);

      expect(translated1).toBe('Bye');
      expect(translated2).toBe('Bye');
    });

    it('should return the message string translated with values applied.', () => {
      const name = 'moonstar';
      const english = localizer.translate('message.test.with_value', 'en', { name });
      const spanish = localizer.translate('message.test.with_value', 'es', { name });
      const french = localizer.translate('message.test.with_value', 'fr', { name });

      expect(english).toBe('Hello moonstar!');
      expect(spanish).toBe('Hola moonstar!');
      expect(french).toBe('Bonjour moonstar!');
    });
  });
});