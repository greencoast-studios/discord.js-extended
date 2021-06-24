/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import level from 'level';
import Discord from 'discord.js';
import DataProvider from './DataProvider';
import ExtendedClient from '../ExtendedClient';

class LevelDataProvider extends DataProvider {
  public readonly location: string;
  private db: level.LevelDB<string, any> | null;
  
  constructor(client: ExtendedClient, location: string) {
    super(client);
    this.location = location;
    this.db = null;
  }

  public init(): Promise<DataProvider> {
    if (this.db) {
      return Promise.resolve(this);
    }

    return new Promise((resolve, reject) => {
      level(this.location, {}, (error?: Error, db?: level.LevelDB<string, any>) => {
        if (error) {
          return reject(error);
        }

        this.db = db!;
        
        this.client.emit('debug', 'LevelDataProvider has been initialized.');

        return resolve(this);
      });
    });
  }

  public destroy(): Promise<void> {
    if (!this.db) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.db!.close((error?: Error) => {
        if (error) {
          return reject(error);
        }

        this.db = null;

        this.client.emit('debug', 'LevelDataProvider has been destroyed.');

        return resolve();
      });
    });
  }

  public override async get(guild: Discord.Guild, key: string, defaultValue?: any): Promise<any> {
    const { id } = guild;

    try {
      return JSON.parse(await this.db!.get(`${id}:${key}`));
    } catch (error) {
      if (error.notFound) {
        return defaultValue;
      }

      throw error;
    }
  }

  public override async getGlobal(key: string, defaultValue?: any): Promise<any> {
    try {
      return JSON.parse(await this.db!.get(`global:${key}`));
    } catch (error) {
      if (error.notFound) {
        return defaultValue;
      }

      throw error;
    }
  }

  public override async set(guild: Discord.Guild, key: string, value: any): Promise<void> {
    const { id } = guild;

    await this.db!.put(`${id}:${key}`, JSON.stringify(value));
  }

  public override async setGlobal(key: string, value: any): Promise<void> {
    await this.db!.put(`global:${key}`, JSON.stringify(value));
  }

  public override async delete(guild: Discord.Guild, key: string): Promise<any> {
    const { id } = guild;

    const data = JSON.parse(await this.db!.get(`${id}:${key}`));
    await this.db!.del(`${id}:${key}`);

    return data;
  }

  public override async deleteGlobal(key: string): Promise<any> {
    const data = JSON.parse(await this.db!.get(`global:${key}`));
    await this.db!.del(`global:${key}`);

    return data;
  }

  public clear(guild: Discord.Guild): Promise<void> {
    const { id } = guild;

    return this.db!.clear({
      gt: `${id}:`,
      lte: `${id}${String.fromCharCode(':'.charCodeAt(0) + 1)}`
    });
  }

  public clearGlobal(): Promise<void> {
    return this.db!.clear({
      gt: 'global:',
      lte: `global${String.fromCharCode(':'.charCodeAt(0) + 1)}`
    });
  }
}

export default LevelDataProvider;
