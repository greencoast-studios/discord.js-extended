import Discord from 'discord.js';
import IntlMessageFormat from 'intl-messageformat';
import ExtendedClient from '../ExtendedClient';
import GuildLocalizer from './GuildLocalizer';
import LocalizerOptions from '../../interfaces/LocalizerOptions';

class Localizer {
  public readonly client: ExtendedClient;
  public readonly localeStrings: Record<string, Record<string, string>>;
  public readonly defaultLocale: string;
  public readonly options: LocalizerOptions;
  public readonly guildLocalizers: Discord.Collection<Discord.Snowflake, GuildLocalizer>;

  constructor(client: ExtendedClient, options: LocalizerOptions) {
    this.client = client;
    this.localeStrings = options.localeStrings;
    this.defaultLocale = options.defaultLocale;
    this.options = options;
    this.guildLocalizers = new Discord.Collection();
  }

  public init(): Promise<string[]> {
    return Promise.all(this.client.guilds.cache.map((guild) => {
      const localizer = new GuildLocalizer(this, guild);
      this.guildLocalizers.set(guild.id, localizer);

      return localizer.init();
    }));
  }

  public getLocalizer(guild: Discord.Guild): GuildLocalizer | undefined {
    return this.guildLocalizers.get(guild.id);
  }

  public getAvailableLocales(): string[] {
    return Object.keys(this.localeStrings);
  }

  public translate(key: string, locale?: string | null, values = {}): string {
    return this.getMessage(key, locale || this.defaultLocale).format(values) as string;
  }

  private getMessage(key: string, locale: string): IntlMessageFormat {
    const messagesForLocale = this.localeStrings[locale];

    if (!messagesForLocale) {
      throw new Error(`No messages with locale ${locale} exist!`);
    }

    const message = messagesForLocale[key];

    if (!message) {
      throw new Error(`No message with key ${key} for locale ${locale} exists!`);
    }

    return new IntlMessageFormat(this.localeStrings[locale][key]);
  }
}

export default Localizer;
