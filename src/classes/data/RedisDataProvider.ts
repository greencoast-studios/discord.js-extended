/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Redis from 'redis';
import Discord from 'discord.js';
import DataProvider from './DataProvider';
import ExtendedClient from '../ExtendedClient';

/**
 * A {@link DataProvider} implemented with a Redis backend. Requires the package [redis](https://www.npmjs.com/package/redis).
 * This data provider was implemented for redis@4.0.2 but any v4 should work.
 */
class RedisDataProvider extends DataProvider {
  /**
   * The Redis client for this data provider.
   * @private
   * @type {Redis.RedisClientType<any, any>>}
   */
  private redis: Redis.RedisClientType<any, any>;

  /**
   * @param client The client that this data provider will be used by.
   * @param options The options passed to the Redis client.
   */
  constructor(client: ExtendedClient, options: Redis.RedisClientOptions<any, any>) {
    super(client);

    this.redis = Redis.createClient(options);
  }

  /**
   * Add event listeners to the Redis client.
   * @param event The Redis client event to listen to.
   * @param listener The listener function to handle the event.
   */
  public on(event: string | symbol, listener: (...args: any[]) => void): this {
    this.redis.on(event, listener);
    return this;
  }

  /**
   * Initialize this Redis data provider. This connects the data provider to the Redis
   * service. It also delegates Redis client error handling to the client's error event. handler
   * @returns A promise that resolves this Redis data provider once it's ready.
   * @emits `client#dataProviderInit`
   */
  public override async init(): Promise<this> {
    await this.redis.connect();

    this.redis.on('error', (error) => this.client.emit('error', error));
    this.client.emit('dataProviderInit', this);

    return this;
  }

  /**
   * Gracefully destroy this Redis data provider. This closes the connection to the Redis
   * service after queued up operations have ended.
   * @emits `client#dataProviderDestroy`
   */
  public override destroy(): Promise<void> {
    this.client.emit('dataProviderDestroy', this);

    return this.redis.quit();
  }

  /**
   * Get a value for a given absolute key.
   * @param key The key of the data to be queried.
   * @param defaultValue The default value in case there is no entry found.
   * @private
   * @returns A promise that resolves the queried data.
   */
  private async _get(key: string, defaultValue?: any): Promise<any> {
    const exists = await this.redis.exists(key);

    if (!exists) {
      return defaultValue;
    }

    return JSON.parse((await this.redis.get(key))!);
  }

  /**
   * Get a value for a key in a guild.
   * @param guild The [guild](https://discord.js.org/#/docs/discord.js/stable/class/Guild) for which the data will be queried.
   * @param key The key of the data to be queried.
   * @param defaultValue The default value in case there is no entry found.
   * @returns A promise that resolves the queried data.
   */
  public override get(guild: Discord.Guild, key: string, defaultValue?: any): Promise<any> {
    const { id } = guild;
    return this._get(`${id}:${key}`, defaultValue);
  }

  /**
   * Get a value for a key in a global scope.
   * @param key The key of the data to be queried.
   * @param defaultValue The default value in case there is no entry found.
   * @returns A promise that resolves the queried data.
   */
  public override getGlobal(key: string, defaultValue?: any): Promise<any> {
    return this._get(`global:${key}`, defaultValue);
  }

  /**
   * Set a value for a given absolute key.
   * @param key The key of the data to be set.
   * @param value The value to set.
   * @private
   * @returns A promise that resolves once the data is saved.
   */
  private async _set(key: string, value: any): Promise<any> {
    await this.redis.set(key, JSON.stringify(value));
  }

  /**
   * Set a value for a key in a guild.
   * @param guild The [guild](https://discord.js.org/#/docs/discord.js/stable/class/Guild) for which the data will be set.
   * @param key The key of the data to be set.
   * @param value The value to set.
   * @returns A promise that resolves once the data is saved.
   */
  public override set(guild: Discord.Guild, key: string, value: any): Promise<any> {
    const { id } = guild;
    return this._set(`${id}:${key}`, value);
  }

  /**
   * Set a value for a key in a global scope.
   * @param key The key of the data to be set.
   * @param value The value to set.
   * @returns A promise that resolves once the data is saved.
   */
  public override setGlobal(key: string, value: any): Promise<any> {
    return this._set(`global:${key}`, value);
  }

  /**
   * Delete a value stored for a given absolute key.
   * @param key The key of the data to be set.
   * @private
   * @returns A promise that resolves once the data has been deleted.
   */
  private async _delete(key: string): Promise<any> {
    return JSON.parse((await this.redis.getDel(key))!);
  }

  /**
   * Delete a key-value pair in a guild.
   * @param guild The [guild](https://discord.js.org/#/docs/discord.js/stable/class/Guild) for which the key-value pair will be deleted.
   * @param key The key to delete.
   * @returns A promise that resolves the data that has been deleted.
   */
  public override delete(guild: Discord.Guild, key: string): Promise<any> {
    const { id } = guild;
    return this._delete(`${id}:${key}`);
  }

  /**
   * Delete a key-value pair in a global scope.
   * @param key The key to delete.
   * @returns A promise that resolves the data that has been deleted.
   */
  public override deleteGlobal(key: string): Promise<any> {
    return this._delete(`global:${key}`);
  }

  /**
   * Clear all data that start with the given pattern.
   * @param startsWith The pattern to look for the keys to delete.
   * @private
   * @returns A promise that resolves once all data has been deleted.
   */
  public async _clear(startsWith: string): Promise<void> {
    const keys = await this.redis.keys(`${startsWith}*`);

    if (!keys || keys.length < 1) {
      return;
    }

    await this.redis.del(keys);
  }

  /**
   * Clear all data in a guild.
   * @param guild The [guild](https://discord.js.org/#/docs/discord.js/stable/class/Guild) to clear the data from.
   * @returns A promise that resolves once all data has been deleted.
   * @emits `client#dataProviderClear`
   */
  public override async clear(guild: Discord.Guild): Promise<void> {
    const { id } = guild;
    await this._clear(`${id}:`);

    this.client.emit('dataProviderClear', guild);
  }

  /**
   * Clear all data in a global scope.
   * @returns A promise that resolves once all data has been deleted.
   * @emits `client#dataProviderClear`
   */
  public override async clearGlobal(): Promise<void> {
    await this._clear('global:');

    this.client.emit('dataProviderClear', null);
  }
}

export default RedisDataProvider;
