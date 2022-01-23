import Discord from 'discord.js';
import IntlMessageFormat from 'intl-messageformat';
import ExtendedClient from '../ExtendedClient';
import GuildLocalizer from './GuildLocalizer';
import LocalizerOptions from '../../interfaces/LocalizerOptions';

/**
 * A class to help with the localization of your bot. This handles string translation based on the
 * [intl-messageformat](https://formatjs.io/docs/intl-messageformat/) package. Strings are defined in
 * [ICU](https://formatjs.io/docs/intl-messageformat/#common-usage-example) format and dynamic values inside.
 * It is recommended to have a data provider set in the client for the locale settings to be saved
 * persistently for each guild.
 */
class Localizer {
  /**
   * The client that this localizer will be used by.
   * @type {ExtendedClient}
   * @memberof Localizer
   */
  public readonly client: ExtendedClient;

  /**
   * An object that maps the name of the locale to another object that contains
   * all the available messages mapped by their keys. The messages should follow
   * a ICU standard, for more information on how to structure these messages, please visit the
   * [following link](https://formatjs.io/docs/intl-messageformat/#common-usage-example).
   *
   * The following is an example of how to structure this object:
   *
   * ```js
   * en: {
   *   'message.test.hello': 'Hello',
   *   'message.test.bye': 'Bye',
   *   'message.test.with_value': 'Hello {name}!'
   * },
   * es: {
   *   'message.test.hello': 'Hola',
   *   'message.test.bye': 'Adios',
   *   'message.test.with_value': 'Hola {name}!'
   * },
   * fr: {
   *   'message.test.hello': 'Bonjour',
   *   'message.test.bye': 'Au revoir',
   *   'message.test.with_value': 'Bonjour {name}!'
   * }
   * ```
   * @type {Record<string, Record<string, string>>}
   * @memberof Localizer
   */
  public readonly localeStrings: Record<string, Record<string, string>>;

  /**
   * The default locale to be used in case a guild does not have its locale set in the
   * client's data provider. You should set a data provider before setting this up so
   * the guild's locale can be saved persistently.
   * @type {string}
   * @memberof Localizer
   */
  public readonly defaultLocale: string;

  /**
   * The options for this localizer.
   * @type {LocalizerOptions}
   * @memberof Localizer
   */
  public readonly options: LocalizerOptions;

  /**
   * The {@link GuildLocalizer}s for each guild.
   * @type {Discord.Collection<Discord.Snowflake, GuildLocalizer>}
   * @memberof Localizer
   */
  public readonly guildLocalizers: Discord.Collection<Discord.Snowflake, GuildLocalizer>;

  /**
   * @param client The client that this localizer will be used by.
   * @param options The options for this localizer.
   * @throws Throws if the supplied default locale is not supported.
   */
  constructor(client: ExtendedClient, options: LocalizerOptions) {
    this.client = client;
    this.localeStrings = options.localeStrings;

    if (!this.isLocaleSupported(options.defaultLocale)) {
      throw new Error(`${options.defaultLocale} is not a supported locale.`);
    }

    this.defaultLocale = options.defaultLocale;
    this.options = options;
    this.guildLocalizers = new Discord.Collection();
  }

  /**
   * Initializes all the {@link GuildLocalizer}s for each guild the client is connected to.
   * You should call this after initializing the client's data provider since this method
   * will read the locale set for each guild and will initialize their localizer with that value.
   * In case the client does not have a data provider, you should still call this method, but the
   * localizers will be initialized with the default locale.
   * This also registers event handlers for client#guildCreate and client#guildDelete events
   * to automatically create or delete localizers if the bot joins or leaves another guild.
   * You should use the `GUILDS` intent.
   * @returns A promise that resolves once all guild localizers are ready.
   * @throws Rejects if a guild localizer was being initialized with an unsupported locale retrieved
   * from the data provider. This may happen if the locale saved in the data provider was updated manually.
   */
  public init(): Promise<string[]> {
    this.client.on('guildCreate', this.handleGuildCreate.bind(this));
    this.client.on('guildDelete', this.handleGuildDelete.bind(this));

    return Promise.all(this.client.guilds.cache.map((guild) => this.handleGuildCreate(guild)));
  }

  /**
   * Handles the creation and initialization of a newly joined guild's localizer.
   * @param guild The [guild](https://discord.js.org/#/docs/discord.js/stable/class/Guild) that was joined.
   * @private
   * @returns A promise that resolves once the guild localizer is ready.
   * @throws Rejects if the guild localizer was being initialized with an unsupported locale retrieved
   * from the data provider. This may happen if the locale saved in the data provider was updated manually.
   */
  private handleGuildCreate(guild: Discord.Guild): Promise<string> {
    const localizer = new GuildLocalizer(this, guild);
    this.guildLocalizers.set(guild.id, localizer);

    return localizer.init();
  }

  /**
   * Handles the deletion of the localizer of the guild that has been left.
   * @param guild The [guild](https://discord.js.org/#/docs/discord.js/stable/class/Guild) that was left.
   * @private
   * @returns A promise that resolves once the guild localizer has been removed from both this and the data
   * provider (if any).
   */
  private handleGuildDelete(guild: Discord.Guild): Promise<void> {
    this.guildLocalizers.delete(guild.id);

    if (!this.client.dataProvider) {
      return Promise.resolve();
    }

    return this.client.dataProvider.delete(guild, this.options.dataProviderKey || 'locale')
      .catch((error) => {
        this.client.emit('warn', `Could not delete locale settings for ${guild.id} from data provider.`);
        this.client.emit('error', error);
      });
  }

  /**
   * Get the localizer for the given guild.
   * @param guild
   * @returns The guild localizer for the given guild.
   */
  public getLocalizer(guild: Discord.Guild): GuildLocalizer | undefined {
    return this.guildLocalizers.get(guild.id);
  }

  /**
   * Get a list of all the available locales retrieved based on the keys of `localeStrings`.
   * @returns An array containing all the available locales.
   */
  public getAvailableLocales(): string[] {
    return Object.keys(this.localeStrings);
  }

  /**
   * Check whether the given locale is supported.
   * @param locale The locale to test.
   * @returns `true` if the locale is supported.
   */
  public isLocaleSupported(locale: string): boolean {
    return this.getAvailableLocales().includes(locale);
  }

  /**
   * Get the message for the given key translated into the given locale. You can also supply an object
   * containing the dynamic values to be used.
   * @param key The key of the message to translate.
   * @param locale The locale to translate the message to.
   * @param values The dynamic values to be replaced in the message.
   * @returns The translated message.
   * @throws Throws if the key does not resolve to any message.
   * @throws Throws if the given locale is not supported.
   */
  public translate(key: string, locale?: string | null, values = {}): string {
    return this.getMessage(key, locale || this.defaultLocale).format(values) as string;
  }

  /**
   * Alias for `translate()`.
   * @param key The key of the message to translate.
   * @param locale The locale to translate the message to.
   * @param values The dynamic values to be replaced in the message.
   * @returns The translated message.
   * @throws Throws if the key does not resolve to any message.
   * @throws Throws if the given locale is not supported.
   */
  public t(key: string, locale?: string | null, values = {}): string {
    return this.translate(key, locale, values);
  }

  /**
   * Get the formatter object to format the message of the given key and locale.
   * If no message for the given locale exists, then the message for the default locale
   * will be used.
   * @param key The key of the message to translate.
   * @param locale The locale to translate the message to.
   * @returns The formatter object for translating the message.
   * @throws Throws if the key does not resolve to any message.
   * @throws Throws if the given locale is not supported.
   */
  private getMessage(key: string, locale: string): IntlMessageFormat {
    const messagesForLocale = this.localeStrings[locale];

    if (!messagesForLocale) {
      throw new Error(`No messages with locale ${locale} exist!`);
    }

    const message = messagesForLocale[key] || this.localeStrings[this.defaultLocale][key];

    if (!message) {
      throw new Error(`No message with key ${key} for locale ${locale} exists!`);
    }

    return new IntlMessageFormat(message);
  }
}

export default Localizer;
