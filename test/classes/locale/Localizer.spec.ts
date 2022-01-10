import Localizer from '../../../src/classes/locale/Localizer';
import ExtendedClient from '../../../src/classes/ExtendedClient';
import { mockedLocaleStrings } from '../../../__mocks__/locale';

const clientMock = new ExtendedClient();

describe('Classes: Locale: Localizer', () => {
  let localizer: Localizer;

  beforeEach(() => {
    localizer = new Localizer(clientMock, { defaultLocale: 'en', localeStrings: mockedLocaleStrings });
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
