import { Guild } from 'discord.js';
import Localizer from './Localizer';

class GuildLocalizer {
  public readonly localizer: Localizer;
  public readonly guild: Guild;

  public readonly dataProviderKey: string;

  public locale: string;

  constructor(localizer: Localizer, guild: Guild) {
    this.localizer = localizer;
    this.guild = guild;

    this.dataProviderKey = localizer.options.dataProviderKey || 'locale';

    this.locale = localizer.defaultLocale;
  }

  public async init(): Promise<string> {
    if (!this.localizer.client.dataProvider) {
      return this.locale;
    }

    this.locale = await this.localizer.client.dataProvider.get(this.guild, this.dataProviderKey, this.locale);

    return this.locale;
  }

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

  public t(key: string): string {
    return this.localizer.translate(key, this.locale);
  }
}

export default GuildLocalizer;
