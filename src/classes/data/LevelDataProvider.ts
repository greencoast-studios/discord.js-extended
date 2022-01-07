/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import level from 'level';
import Discord from 'discord.js';
import DataProvider from './DataProvider';
import ExtendedClient from '../ExtendedClient';

/**
 * A {@link DataProvider} implemented with a LevelDB backend. Requires the package [level](https://www.npmjs.com/package/level).
 */
class LevelDataProvider extends DataProvider {
  /**
   * The fully resolved path where the LevelDB database will be saved.
   * @type {string}
   * @memberof LevelDataProvider
   */
  public readonly location: string;

  /**
   * The LevelDB instance for this data provider.
   * @private
   * @type {(level.LevelDB<string, any> | null)}
   * @memberof LevelDataProvider
   */
  private db: level.LevelDB<string, any> | null;

  /**
   * Instantiate a LevelDB data provider.
   * @param client The client that this data provider will be used by.
   * @param location The fully resolved path where the LevelDB database will be saved. This must resolve to a directory.
   */
  constructor(client: ExtendedClient, location: string) {
    super(client);
    this.location = location;
    this.db = null;
  }

  /**
   * Initialize this LevelDB data provider. This creates the database instance and the
   * database files inside the location specified.
   * @returns A promise that resolves this LevelDB data provider once it's ready.
   */
  public override init(): Promise<this> {
    if (this.db) {
      return Promise.resolve(this);
    }

    return new Promise((resolve, reject) => {
      level(this.location, {}, (error?: Error, db?: level.LevelDB<string, any>) => {
        if (error) {
          return reject(error);
        }

        this.db = db!;

        this.client.emit('dataProviderInit', this);

        return resolve(this);
      });
    });
  }

  /**
   * Gracefully destroy this LevelDB data provider. This closes the database connection.
   * Once this is called, this data provider will be unusable.
   * @returns A promise that resolves once this data provider is destroyed.
   * @emits `client#dataProviderDestroy`
   */
  public override destroy(): Promise<void> {
    if (!this.db) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.db!.close((error?: Error) => {
        if (error) {
          return reject(error);
        }

        this.db = null;

        this.client.emit('dataProviderDestroy', this);

        return resolve();
      });
    });
  }

  /**
   * Get a value for a key in a guild.
   * @param guild The [guild](https://discord.js.org/#/docs/main/stable/class/Guild) for which the data will be queried.
   * @param key The key of the data to be queried.
   * @param defaultValue The default value in case there is no entry found.
   * @returns A promise that resolves the queried data.
   */
  public override async get(guild: Discord.Guild, key: string, defaultValue?: any): Promise<any> {
    const { id } = guild;

    try {
      return JSON.parse(await this.db!.get(`${id}:${key}`));
    } catch (error: any) {
      if (error.notFound) {
        return defaultValue;
      }

      throw error;
    }
  }

  /**
   * Get a value for a key in a global scope.
   * @param key The key of the data to be queried.
   * @param defaultValue The default value in case there is no entry found.
   * @returns A promise that resolves the queried data.
   */
  public override async getGlobal(key: string, defaultValue?: any): Promise<any> {
    try {
      return JSON.parse(await this.db!.get(`global:${key}`));
    } catch (error: any) {
      if (error.notFound) {
        return defaultValue;
      }

      throw error;
    }
  }

  /**
   * Set a value for a key in a guild.
   * @param guild The [guild](https://discord.js.org/#/docs/main/stable/class/Guild) for which the data will be set.
   * @param key The key of the data to be set.
   * @param value The value to set.
   * @returns A promise that resolves once the data is saved.
   */
  public override async set(guild: Discord.Guild, key: string, value: any): Promise<void> {
    const { id } = guild;

    await this.db!.put(`${id}:${key}`, JSON.stringify(value));
  }

  /**
   * Set a value for a key in a global scope.
   * @param key The key of the data to be set.
   * @param value The value to set.
   * @returns A promise that resolves once the data is saved.
   */
  public override async setGlobal(key: string, value: any): Promise<void> {
    await this.db!.put(`global:${key}`, JSON.stringify(value));
  }

  /**
   * Delete a key-value pair in a guild.
   * @param guild The [guild](https://discord.js.org/#/docs/main/stable/class/Guild) for which the key-value pair will be deleted.
   * @param key The key to delete.
   * @returns A promise that resolves the data that was deleted.
   */
  public override async delete(guild: Discord.Guild, key: string): Promise<any> {
    const { id } = guild;

    const data = JSON.parse(await this.db!.get(`${id}:${key}`));
    await this.db!.del(`${id}:${key}`);

    return data;
  }

  /**
   * Delete a key-value pair in a global scope.
   * @param key The key to delete.
   * @returns A promise that resolves the data that was deleted.
   */
  public override async deleteGlobal(key: string): Promise<any> {
    const data = JSON.parse(await this.db!.get(`global:${key}`));
    await this.db!.del(`global:${key}`);

    return data;
  }

  /**
   * Clear all data in a guild.
   * @param guild The [guild](https://discord.js.org/#/docs/main/stable/class/Guild) to clear the data from.
   * @returns A promise that resolves once all data is deleted.
   * @emits `client#dataProviderClear`
   */
  public override async clear(guild: Discord.Guild): Promise<void> {
    const { id } = guild;

    await this.db!.clear({
      gt: `${id}:`,
      lte: `${id}${String.fromCharCode(':'.charCodeAt(0) + 1)}`
    });

    this.client.emit('dataProviderClear', guild);
  }

  /**
   * Clear all data in a global scope.
   * @returns A promise that resolves once all data is deleted.
   * @emits `client#dataProviderClear`
   */
  public override async clearGlobal(): Promise<void> {
    await this.db!.clear({
      gt: 'global:',
      lte: `global${String.fromCharCode(':'.charCodeAt(0) + 1)}`
    });

    this.client.emit('dataProviderClear', null);
  }
}

export default LevelDataProvider;
