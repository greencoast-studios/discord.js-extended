import ExtendedClient from '../ExtendedClient';
import Templater from '../abstract/Templater';
import { version } from '../../';

/**
 * A templater class to help with the application of templates for presence statuses.
 */
class PresenceTemplater extends Templater {
  public readonly client: ExtendedClient;

  /**
   * @param client The ExtendedClient for this PresenceTemplater.
   */
  constructor(client: ExtendedClient) {
    super([
      'num_guilds',
      'prefix',
      'cur_time',
      'owner_name',
      'client_name',
      'version'
    ]);

    this.client = client;
  }

  public get(key: string): string {
    switch (key) {
      case 'num_guilds':
        return this.getNumberOfGuilds();
      case 'prefix':
        return this.getPrefix();
      case 'cur_time':
        return this.getCurrentTime();
      case 'owner_name':
        return this.getOwnerName();
      case 'client_name':
        return this.getClientName();
      case 'version':
        return this.getVersion();
      default:
        throw new Error('Unknown key inserted in PresenceTemplater.');
    }
  }

  /**
   * Get the number of guilds the client is connected to.
   * @returns The number of guilds.
   */
  private getNumberOfGuilds(): string {
    return this.client.guilds.cache.reduce((sum) => sum + 1, 0).toString();
  }

  /**
   * Get the prefix used by the client.
   * @returns The client's prefix.
   */
  private getPrefix(): string {
    return this.client.prefix;
  }

  /**
   * Get the current time in the client's locale.
   * @returns The current time.
   */
  private getCurrentTime(): string {
    return new Date().toLocaleTimeString();
  }

  /**
   * Get the owner's name. If no owner is specified then it returns 'undefined'.
   * @returns The owner's name.
   */
  private getOwnerName(): string {
    return this.client.owner?.username || 'undefined';
  }

  /**
   * Get the client's name. If the client's user is not ready yet then it returns 'undefined'.
   * @returns The client's name.
   */
  private getClientName(): string {
    return this.client.user?.username || 'undefined';
  }

  /**
   * Get the version of the discord.js-extended library.
   * @returns discord.js-extended's version.
   */
  private getVersion(): string {
    return version;
  }
}

export default PresenceTemplater;
