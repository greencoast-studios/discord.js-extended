import Discord from 'discord.js';
import Localizer from './Localizer';

/**
 * A class to help with localization of your bot. This handles string translation from the context of the
 * guild. For more information, check {@link Localizer}.
 */
class GuildLocalizer {
  /**
   * The main localizer for this guild localizer.
   * @type {Localizer}
   * @memberof {GuildLocalizer}
   */
  public readonly localizer: Localizer;

  /**
   * The guild that corresponds to this guild localizer.
   * @type {Discord.Guild}
   * @memberof {GuildLocalizer}
   */
  public readonly guild: Discord.Guild;

  /**
   * The key to be used to save the guild's locale in the client's
   * data provider.
   * @type {string}
   * @default `locale`
   * @memberof {GuildLocalizer}
   */
  public readonly dataProviderKey: string;

  /**
   * The current locale set for the guild. Do not update this value manually, instead use
   * the `updateLocale()` method.
   * @type {string}
   * @memberof {GuildLocalizer}
   */
  public locale: string;

  /**
   * @param localizer The main localizer for this guild localizer.
   * @param guild The guild that corresponds to this guild localizer.
   */
  constructor(localizer: Localizer, guild: Discord.Guild) {
    this.localizer = localizer;
    this.guild = guild;

    this.dataProviderKey = localizer.options.dataProviderKey || 'locale';

    this.locale = localizer.defaultLocale;
  }

  /**
   * Initializes this guild localizer.
   * You should call this after initializing the client's data provider since this method
   * will read the locale set for each guild and will initialize their localizer with that value.
   * @returns A promise that resolves to the locale set for this guild localizer.
   * @throws Rejects if a guild localizer was being initialized with an unsupported locale retrieved
   * from the data provider. This may happen if the locale saved in the data provider was updated manually.
   */
  public async init(): Promise<string> {
    if (!this.localizer.client.dataProvider) {
      return this.locale;
    }

    const savedLocale = await this.localizer.client.dataProvider.get(this.guild, this.dataProviderKey, this.locale);

    const availableLocales = this.localizer.getAvailableLocales();
    if (!availableLocales.includes(savedLocale)) {
      throw new Error(`Invalid locale ${savedLocale} received from data provider. Perhaps you changed the value for ${this.dataProviderKey} manually?`);
    }

    this.locale = savedLocale;

    return this.locale;
  }

  /**
   * Updates the locale set to this guild localizer. If the client has a data provider, it will also update
   * the locale in it for persistence.
   * @param locale The new locale to be used by this guild localizer.
   * @returns A promise that resolves once the locale has been updated.
   * @throws Rejects if the given locale is not supported.
   */
  public async updateLocale(locale: string): Promise<void> {
    const availableLocales = this.localizer.getAvailableLocales();
    if (!availableLocales.includes(locale)) {
      throw new Error(`${locale} is not a supported locale.`);
    }

    this.locale = locale;

    if (!this.localizer.client.dataProvider) {
      return;
    }

    return this.localizer.client.dataProvider.set(this.guild, this.dataProviderKey, this.locale);
  }

  /**
   * Get the message for the given key translated into the locale of this
   * guild localizer. You can also supply an object
   * containing the dynamic values to be used.
   * @param key The key of the message to translate.
   * @param values The dynamic values to be replaced in the message.
   * @returns The translated message.
   * @throws Throws if the key does not resolve to any message.
   * @throws Throws if the given locale is not supported.
   */
  public translate(key: string, values = {}): string {
    return this.localizer.translate(key, this.locale, values);
  }

  /**
   * Alias for `translate()`.
   * @param key The key of the message to translate.
   * @param values The dynamic values to be replaced in the message.
   * @returns The translated message.
   * @throws Throws if the key does not resolve to any message.
   * @throws Throws if the given locale is not supported.
   */
  public t(key: string, values = {}): string {
    return this.translate(key, values);
  }
}

export default GuildLocalizer;
