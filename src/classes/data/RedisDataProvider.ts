/* eslint-disable @typescript-eslint/no-explicit-any */
import Redis from 'redis';
import Discord from 'discord.js';
import DataProvider from './DataProvider';
import ExtendedClient from '../ExtendedClient';

class RedisDataProvider extends DataProvider {
  private redis: Redis.RedisClientType<any, any>;

  constructor(client: ExtendedClient, options: Redis.RedisClientOptions<any, any>) {
    super(client);

    this.redis = Redis.createClient(options);
  }

  public on(event: string | symbol, listener: (...args: any[]) => void): this {
    this.redis.on(event, listener);
    return this;
  }

  public override async init(): Promise<this> {
    await this.redis.connect();

    this.redis.on('error', (error) => this.client.emit('error', error));
    this.client.emit('dataProviderInit', this);

    return this;
  }

  public override destroy(): Promise<void> {
    this.client.emit('dataProviderDestroy', this);

    return this.redis.quit();
  }

  private async _get(key: string, defaultValue?: any): Promise<any> {
    const exists = await this.redis.exists(key);

    if (!exists) {
      return defaultValue;
    }

    return JSON.parse((await this.redis.get(key))!);
  }

  public override get(guild: Discord.Guild, key: string, defaultValue?: any): Promise<any> {
    const { id } = guild;
    return this._get(`${id}:${key}`, defaultValue);
  }

  public override getGlobal(key: string, defaultValue?: any): Promise<any> {
    return this._get(`global:${key}`, defaultValue);
  }

  private async _set(key: string, value: any): Promise<any> {
    await this.redis.set(key, JSON.stringify(value));
  }

  public override set(guild: Discord.Guild, key: string, value: any): Promise<any> {
    const { id } = guild;
    return this._set(`${id}:${key}`, value);
  }

  public override setGlobal(key: string, value: any): Promise<any> {
    return this._set(`global:${key}`, value);
  }

  private async _delete(key: string): Promise<any> {
    return JSON.parse((await this.redis.getDel(key))!);
  }

  public override delete(guild: Discord.Guild, key: string): Promise<any> {
    const { id } = guild;
    return this._delete(`${id}:${key}`);
  }

  public override deleteGlobal(key: string): Promise<any> {
    return this._delete(`global:${key}`);
  }

  public async _clear(startsWith: string): Promise<void> {
    const keys = await this.redis.keys(`${startsWith}*`);
    await this.redis.del(keys);
  }

  public override async clear(guild: Discord.Guild): Promise<void> {
    const { id } = guild;
    await this._clear(`${id}:`);

    this.client.emit('dataProviderClear', guild);
  }

  public override async clearGlobal(): Promise<void> {
    await this._clear('global:');

    this.client.emit('dataProviderClear', null);
  }
}

export default RedisDataProvider;
