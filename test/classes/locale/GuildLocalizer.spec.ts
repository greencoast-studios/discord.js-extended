import Discord from 'discord.js';
import GuildLocalizer from '../../../src/classes/locale/GuildLocalizer';
import Localizer from '../../../src/classes/locale/Localizer';
import ExtendedClient from '../../../src/classes/ExtendedClient';
import { GuildMock } from '../../../__mocks__/discordMocks';
import ConcreteDataProvider from '../../../__mocks__/dataProvider';
import { mockedLocaleStrings } from '../../../__mocks__/locale';

const clientMock = new ExtendedClient();
const mainLocalizerMock = new Localizer(clientMock, { defaultLocale: 'en', localeStrings: mockedLocaleStrings });
const guildMock = new GuildMock() as Discord.Guild;

describe('Classes: Locale: GuildLocalizer', () => {
  let localizer: GuildLocalizer;

  let getSpy: jest.SpyInstance;
  let setSpy: jest.SpyInstance;

  beforeAll(async() => {
    await clientMock.setDataProvider(new ConcreteDataProvider(clientMock));
    getSpy = jest.spyOn(clientMock.dataProvider!, 'get');
    setSpy = jest.spyOn(clientMock.dataProvider!, 'set');
  });

  beforeEach(() => {
    localizer = new GuildLocalizer(mainLocalizerMock, guildMock);
  });

  describe('init()', () => {
    it('should resolve the default locale if no data provider is present in client.', () => {
      const client = new ExtendedClient();
      const mainLocalizer = new Localizer(client, { defaultLocale: 'en', localeStrings: mockedLocaleStrings });
      const guildLocalizer = new GuildLocalizer(mainLocalizer, guildMock);

      return guildLocalizer.init()
        .then((locale) => {
          expect(locale).toBe('en');
        });
    });

    it('should reject if the locale stored is not supported.', () => {
      getSpy.mockResolvedValueOnce('unknown');
      expect.assertions(2);

      return localizer.init()
        .catch((error) => {
          expect(error).toBeInstanceOf(Error);
          expect(localizer.locale).toBe('en');
        });
    });

    it('should resolve the locale stored in the data provider.', () => {
      getSpy.mockResolvedValueOnce('fr');

      return localizer.init()
        .then((locale) => {
          expect(locale).toBe('fr');
        });
    });

    it('should set the locale value.', () => {
      getSpy.mockResolvedValueOnce('fr');

      return localizer.init()
        .then(() => {
          expect(localizer.locale).toBe('fr');
        });
    });
  });

  describe('updateLocale()', () => {
    it('should reject if the supplied locale is not supported.', () => {
      expect.assertions(1);

      return localizer.updateLocale('unknown')
        .catch((error) => {
          expect(error.message).toContain('not a supported locale');
        });
    });

    it('should not update the locale if the supplied one is not supported.', () => {
      expect.assertions(1);

      return localizer.updateLocale('unknown')
        .catch(() => {
          expect(localizer.locale).toBe('en');
        });
    });

    it('should set the locale value with the one supplied.', () => {
      return localizer.updateLocale('es')
        .then(() => {
          expect(localizer.locale).toBe('es');
        });
    });

    it('should update the locale in the data provider.', () => {
      return localizer.updateLocale('es')
        .then(() => {
          expect(setSpy).toHaveBeenCalledWith(localizer.guild, 'locale', 'es');
        });
    });
  });

  describe('translate()', () => {
    it('should call localizer.translate with the correct values.', () => {
      const translateSpy = jest.spyOn(localizer.localizer, 'translate');
      localizer.translate('message.test.hello');
      expect(translateSpy).toHaveBeenCalledWith('message.test.hello', localizer.locale, {});
    });
  });

  describe('t()', () => {
    it('should call translate with the correct values.', () => {
      const translateSpy = jest.spyOn(localizer, 'translate');
      localizer.t('message.test.hello');
      expect(translateSpy).toHaveBeenCalledWith('message.test.hello', {});
    });
  });
});
