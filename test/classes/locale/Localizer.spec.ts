import { GuildMock, mockDiscordJs } from '../../../__mocks__/local/discordMocks';
mockDiscordJs();

import { Localizer, GuildLocalizer, ExtendedClient } from '../../../src';
import { Guild } from 'discord.js';
import { mockedLocaleStrings } from '../../../__mocks__/local/locale';

const clientMock = new ExtendedClient();
const guildMock = new GuildMock() as Guild;

describe('Classes: Locale: Localizer', () => {
  let localizer: Localizer;

  beforeEach(() => {
    localizer = new Localizer(clientMock, { defaultLocale: 'en', localeStrings: mockedLocaleStrings });
  });

  describe('constructor()', () => {
    it('should throw if the default locale is not supported.', () => {
      expect(() => {
        localizer = new Localizer(clientMock, { defaultLocale: 'unknown', localeStrings: mockedLocaleStrings });
      }).toThrow();
    });
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

    it('should register guildCreate and guildDelete event handlers.', () => {
      return localizer.init()
        .then(() => {
          expect(clientMock.on).toHaveBeenCalledWith('guildCreate', expect.anything());
          expect(clientMock.on).toHaveBeenCalledWith('guildDelete', expect.anything());
        });
    });
  });

  describe('private handleGuildDelete()', () => {
    it('should delete the localizer for the guild.', () => {
      return localizer['handleGuildDelete'](guildMock)
        .then(() => {
          expect(localizer.guildLocalizers.has(guildMock.id)).toBe(false);
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

  describe('isLocaleSupported()', () => {
    it('should return true if the locale is supported.', () => {
      expect(localizer.isLocaleSupported('en')).toBe(true);
    });

    it('should return false if the locale is not supported.', () => {
      expect(localizer.isLocaleSupported('unknown')).toBe(false);
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

    it('should use the default locale if message key does not exist in target locale but does in the default one.', () => {
      expect(localizer.translate('exists.only.in.en', 'en')).toBe('I only exist in english');
      expect(localizer.translate('exists.only.in.en', 'es')).toBe('I only exist in english');
      expect(localizer.translate('exists.only.in.en', 'fr')).toBe('I only exist in english');
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

  describe('t()', () => {
    it('should call translate with the correct values.', () => {
      const translateSpy = jest.spyOn(localizer, 'translate');
      localizer.t('message.test.hello', 'en');
      expect(translateSpy).toHaveBeenCalledWith('message.test.hello', 'en', {});
    });
  });
});
