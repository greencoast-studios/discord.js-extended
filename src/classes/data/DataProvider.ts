/* eslint-disable @typescript-eslint/no-explicit-any */
import { Guild } from 'discord.js';
import { ExtendedClient } from '../ExtendedClient';

/**
 * An abstract DataProvider, it contains all the methods that need to be implemented for any DataProvider with a custom backend.
 */
export abstract class DataProvider {
  /**
   * The client that this data provider will be used by.
   * @type {ExtendedClient}
   * @memberof DataProvider
   */
  public readonly client: ExtendedClient;

  /**
   * @param client The client that this data provider will be used by.
   */
  public constructor(client: ExtendedClient) {
    this.client = client;
  }

  /**
   * Initialize this data provider. Database connection and instantiation should be done here.
   * If the data provider is already initialized, this method should not reinitialize it.
   * @returns A promise that resolves this data provider once it's ready.
   * @emits `client#dataProviderInit`
   */
  public abstract init(): Promise<this>;

  /**
   * Gracefully destroy this data provider. This should close any connections.
   * The instance should be unusable after calling this method.
   * @returns A promise that resolves once this data provider is destroyed.
   * @emits `client#dataProviderDestroy`
   */
  public abstract destroy(): Promise<void>;

  /**
   * Get a value for a key in a guild. If no value is found, this method should return `undefined` if no `defaultValue` is provided.
   * @param guild The [guild](https://old.discordjs.dev/#/docs/discord.js/main/class/Guild) for which the data will be queried.
   * @param key The key of the data to be queried.
   * @returns A promise that resolves the queried data.
   */
  public abstract get<T = any>(guild: Guild, key: string): Promise<T | undefined>;
  /**
   * Get a value for a key in a guild. If no value is found, this method should return `undefined` if no `defaultValue` is provided.
   * @param guild The [guild](https://old.discordjs.dev/#/docs/discord.js/main/class/Guild) for which the data will be queried.
   * @param key The key of the data to be queried.
   * @param defaultValue The default value in case there is no entry found.
   * @returns A promise that resolves the queried data.
   */
  public abstract get<T = any>(guild: Guild, key: string, defaultValue: T): Promise<T>;
  /**
   * Get a value for a key in a guild. If no value is found, this method should return `undefined` if no `defaultValue` is provided.
   * @param guild The [guild](https://old.discordjs.dev/#/docs/discord.js/main/class/Guild) for which the data will be queried.
   * @param key The key of the data to be queried.
   * @param defaultValue The default value in case there is no entry found.
   * @returns A promise that resolves the queried data.
   */
  public abstract get<T = any>(guild: Guild, key: string, defaultValue?: T): Promise<T | undefined>;

  /**
   * Get a value for a key in a global scope. If no value is found, this method should return `undefined` if no `defaultValue` is provided.
   * @param key The key of the data to be queried.
   * @returns A promise that resolves the queried data.
   */
  public abstract getGlobal<T = any>(key: string): Promise<T | undefined>;
  /**
   * Get a value for a key in a global scope. If no value is found, this method should return `undefined` if no `defaultValue` is provided.
   * @param key The key of the data to be queried.
   * @param defaultValue The default value in case there is no entry found.
   * @returns A promise that resolves the queried data.
   */
  public abstract getGlobal<T = any>(key: string, defaultValue: T): Promise<T>;
  /**
   * Get a value for a key in a global scope. If no value is found, this method should return `undefined` if no `defaultValue` is provided.
   * @param key The key of the data to be queried.
   * @param defaultValue The default value in case there is no entry found.
   * @returns A promise that resolves the queried data.
   */
  public abstract getGlobal<T = any>(key: string, defaultValue?: T): Promise<T | undefined>;

  /**
   * Set a value for a key in a guild.
   * @param guild The [guild](https://old.discordjs.dev/#/docs/discord.js/main/class/Guild) for which the data will be set.
   * @param key The key of the data to be set.
   * @param value The value to set.
   * @returns A promise that resolves once the data is saved.
   */
  public abstract set<T = any>(guild: Guild, key: string, value: T): Promise<void>;

  /**
   * Set a value for a key in a global scope.
   * @param key The key of the data to be set.
   * @param value The value to set.
   * @returns A promise that resolves once the data is saved.
   */
  public abstract setGlobal<T = any>(key: string, value: T): Promise<void>;

  /**
   * Delete a key-value pair in a guild and return the old value. If the key does not exist, this function should return `undefined`.
   * @param guild The [guild](https://old.discordjs.dev/#/docs/discord.js/main/class/Guild) for which the key-value pair will be deleted.
   * @param key The key to delete.
   * @returns A promise that resolves the data that was deleted.
   */
  public abstract delete<T = any>(guild: Guild, key: string): Promise<T | undefined>;

  /**
   * Delete a key-value pair in a global scope and return the old value. If the key does not exist, this function should return `undefined`.
   * @param key The key to delete.
   * @returns A promise that resolves the data that was deleted.
   */
  public abstract deleteGlobal<T = any>(key: string): Promise<T | undefined>;

  /**
   * Clear all data in a guild.
   * @param guild The [guild](https://old.discordjs.dev/#/docs/discord.js/main/class/Guild) to clear the data from.
   * @returns A promise that resolves once all data is deleted.
   * @emits `client#dataProviderClear`
   */
  public abstract clear(guild: Guild): Promise<void>;

  /**
   * Clear all data in a global scope.
   * @returns A promise that resolves once all data is deleted.
   * @emits `client#dataProviderClear`
   */
  public abstract clearGlobal(): Promise<void>;
}
