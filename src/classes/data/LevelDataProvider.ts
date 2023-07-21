/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import level from 'level';
import Discord from 'discord.js';
import DataProvider from './DataProvider';
import ExtendedClient from '../ExtendedClient';

/**
 * A {@link DataProvider} implemented with a Level backend. Requires the package [level](https://www.npmjs.com/package/level).
 * This data provider was implemented for level@7.0.1 but any v7 should work.
 */
class LevelDataProvider extends DataProvider {
  /**
   * The fully resolved path where the Level database will be saved.
   * @type {string}
   * @memberof LevelDataProvider
   */
  public readonly location: string;

  /**
   * The Level instance for this data provider.
   * @private
   * @type {(level.Level<string, any> | null)}
   * @memberof LevelDataProvider
   */
  private db: level.Level<string, any> | null;

  /**
   * @param client The client that this data provider will be used by.
   * @param location The fully resolved path where the Level database will be saved. This must resolve to a directory.
   */
  constructor(client: ExtendedClient, location: string) {
    super(client);
    this.location = location;
    this.db = null;
  }

  /**
   * Initialize this Level data provider. This creates the database instance and the
   * database files inside the location specified.
   * @returns A promise that resolves this Level data provider once it's ready.
   * @emits `client#dataProviderInit`
   */
  public override async init(): Promise<this> {
    if (!this.db) {
      this.db = new level.Level(this.location);
      this.client.emit('dataProviderInit', this);
    }

    return this;
  }

  /**
   * Gracefully destroy this Level data provider. This closes the database connection.
   * Once this is called, this data provider will be unusable.
   * @returns A promise that resolves once this data provider is destroyed.
   * @emits `client#dataProviderDestroy`
   */
  public override async destroy(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
      this.client.emit('dataProviderDestroy', this);
    }
  }

  /**
   * Get a value for a given absolute key.
   * @param key The key of the data to be queried.
   * @param defaultValue The default value in case there is no entry found.
   * @private
   * @returns A promise that resolves the queried data.
   */
  private async _get(key: string, defaultValue?: string): Promise<any> {
    try {
      return JSON.parse(await this.db!.get(key));
    } catch (error: any) {
      if (error.notFound) {
        return defaultValue;
      }

      throw error;
    }
  }

  /**
   * Get a value for a key in a guild.
   * @param guild The [guild](https://discord.js.org/#/docs/discord.js/stable/class/Guild) for which the data will be queried.
   * @param key The key of the data to be queried.
   * @param defaultValue The default value in case there is no entry found.
   * @returns A promise that resolves the queried data.
   */
  public override async get(guild: Discord.Guild, key: string, defaultValue?: any): Promise<any> {
    const { id } = guild;
    return this._get(`${id}:${key}`, defaultValue);
  }

  /**
   * Get a value for a key in a global scope.
   * @param key The key of the data to be queried.
   * @param defaultValue The default value in case there is no entry found.
   * @returns A promise that resolves the queried data.
   */
  public override async getGlobal(key: string, defaultValue?: any): Promise<any> {
    return this._get(`global:${key}`, defaultValue);
  }

  private async _set(key: string, value: any): Promise<any> {
    await this.db!.put(key, JSON.stringify(value));
  }

  /**
   * Set a value for a key in a guild.
   * @param guild The [guild](https://discord.js.org/#/docs/discord.js/stable/class/Guild) for which the data will be set.
   * @param key The key of the data to be set.
   * @param value The value to set.
   * @returns A promise that resolves once the data is saved.
   */
  public override async set(guild: Discord.Guild, key: string, value: any): Promise<void> {
    const { id } = guild;
    return this._set(`${id}:${key}`, value);
  }

  /**
   * Set a value for a key in a global scope.
   * @param key The key of the data to be set.
   * @param value The value to set.
   * @returns A promise that resolves once the data is saved.
   */
  public override async setGlobal(key: string, value: any): Promise<void> {
    return this._set(`global:${key}`, value);
  }

  /**
   * Delete a value stored for a given absolute key.
   * @param key The key of the data to be set.
   * @private
   * @returns A promise that resolves once the data has been deleted.
   */
  private async _delete(key: string): Promise<any> {
    const data = JSON.parse(await this.db!.get(key));
    await this.db!.del(key);

    return data;
  }

  /**
   * Delete a key-value pair in a guild.
   * @param guild The [guild](https://discord.js.org/#/docs/discord.js/stable/class/Guild) for which the key-value pair will be deleted.
   * @param key The key to delete.
   * @returns A promise that resolves the data that has been deleted.
   */
  public override async delete(guild: Discord.Guild, key: string): Promise<any> {
    const { id } = guild;
    return this._delete(`${id}:${key}`);
  }

  /**
   * Delete a key-value pair in a global scope.
   * @param key The key to delete.
   * @returns A promise that resolves the data that has been deleted.
   */
  public override async deleteGlobal(key: string): Promise<any> {
    return this._delete(`global:${key}`);
  }

  /**
   * Clear all data that start with the given pattern.
   * @param startsWith The pattern to look for the keys to delete.
   * @private
   * @returns A promise that resolves once all data has been deleted.
   */
  public async _clear(startsWith: string): Promise<void> {
    await this.db!.clear({
      gt: `${startsWith}:`,
      lte: `${startsWith}${String.fromCharCode(':'.charCodeAt(0) + 1)}`
    });
  }

  /**
   * Clear all data in a guild.
   * @param guild The [guild](https://discord.js.org/#/docs/discord.js/stable/class/Guild) to clear the data from.
   * @returns A promise that resolves once all data has been deleted.
   * @emits `client#dataProviderClear`
   */
  public override async clear(guild: Discord.Guild): Promise<void> {
    const { id } = guild;
    await this._clear(id);

    this.client.emit('dataProviderClear', guild);
  }

  /**
   * Clear all data in a global scope.
   * @returns A promise that resolves once all data has been deleted.
   * @emits `client#dataProviderClear`
   */
  public override async clearGlobal(): Promise<void> {
    await this._clear('global');

    this.client.emit('dataProviderClear', null);
  }
}

export default LevelDataProvider;
