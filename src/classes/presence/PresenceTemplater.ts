import humanizeDuration from 'humanize-duration';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import ExtendedClient from '../ExtendedClient';
import AsyncTemplater from '../abstract/AsyncTemplater';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * An async templater class to help with the application of templates for presence statuses.
 *
 * Supported templates:
 *
 * | Template         | Replaced by                                                                                                                 |
 * |------------------|-----------------------------------------------------------------------------------------------------------------------------|
 * | `{num_guild}`    | Get the number of guilds the client is connected to.                                                                        |
 * | `{prefix}`       | Get the prefix used by the client.                                                                                          |
 * | `{cur_time}`     | Get the current time in the client's locale.                                                                                |
 * | `{owner_name}`   | Get the owner's name. If no owner is specified then it returns `undefined`.                                                 |
 * | `{client_name}`  | Get the client's name. If the client's user is not ready yet, then it returns `undefined`.                                   |
 * | `{uptime}`       | Get the client's uptime since last ready event emitted in a human-readable shape. Returns `null` if no uptime is available. |
 * | `{ready_time}`   | Get the client's time at which the last ready event was emitted. Returns `null` if no `readyAt` timestamp is available.     |
 * | `{num_members}`  | Get the total number of members across all the guilds that the client is connected to.                                      |
 * | `{num_commands}` | Get the number of commands registered to this client.                                                                       |
 */
class PresenceTemplater extends AsyncTemplater {
  /**
   * The client that this presence async templater will use as a data source.
   * @type {ExtendedClient}
   * @memberof PresenceTemplater
   */
  public readonly client: ExtendedClient;

  /**
   * @param client The client that this presence async templater will use as a data source.
   */
  constructor(client: ExtendedClient) {
    super([
      'num_guilds',
      'prefix',
      'cur_time',
      'owner_name',
      'client_name',
      'uptime',
      'ready_time',
      'num_members',
      'num_commands'
    ]);

    this.client = client;
  }

  public get(key: string): Promise<string> {
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
      case 'uptime':
        return this.getUptime();
      case 'ready_time':
        return this.getReadyTime();
      case 'num_members':
        return this.getNumberOfMembers();
      case 'num_commands':
        return this.getNumberOfCommands();
      default:
        return Promise.reject(new Error('Unknown key inserted in PresenceTemplater.'));
    }
  }

  /**
   * Get the number of guilds the client is connected to.
   * @returns A promise that resolves to the number of [guilds](https://discord.js.org/#/docs/main/stable/class/Guild).
   */
  private getNumberOfGuilds(): Promise<string> {
    return Promise.resolve(this.client.guilds.cache.reduce((sum) => sum + 1, 0).toString());
  }

  /**
   * Get the prefix used by the client.
   * @returns A promise that resolves to the client's prefix.
   */
  private getPrefix(): Promise<string> {
    return Promise.resolve(this.client.prefix);
  }

  /**
   * Get the current time in the client's locale.
   * @returns A promise that resolves to the current time.
   */
  private getCurrentTime(): Promise<string> {
    return Promise.resolve(dayjs(new Date().getTime()).tz().format('hh:mm:ss A'));
  }

  /**
   * Get the owner's name. If no owner is specified then it returns `undefined`.
   * @returns A promise that resolves to the owner's name.
   */
  private getOwnerName(): Promise<string> {
    return Promise.resolve(this.client.owner?.username || 'undefined');
  }

  /**
   * Get the client's name. If the client's user is not ready yet, then it returns `undefined`.
   * @returns A promise that resolves to the client's name.
   */
  private getClientName(): Promise<string> {
    return Promise.resolve(this.client.user?.username || 'undefined');
  }

  /**
   * Get the client's uptime since last ready event emitted in a human-readable shape.
   * Returns `null` if no uptime is available.
   * @returns A promise that resolves to the client's uptime.
   */
  private getUptime(): Promise<string> {
    if (!this.client.uptime) {
      return Promise.resolve('null');
    }

    const uptime = humanizeDuration(this.client.uptime, {
      largest: 3,
      units: ['d', 'h', 'm'],
      round: true,
      conjunction: ' and ',
      serialComma: false
    });

    return Promise.resolve(uptime);
  }

  /**
   * Get the client's time at which the last ready event was emitted. Returns `null`
   * if no `readyAt` timestamp is available.
   * @returns A promise that resolves to the time the client has gone ready.
   */
  private getReadyTime(): Promise<string> {
    if (!this.client.readyTimestamp) {
      return Promise.resolve('null');
    }

    return Promise.resolve(dayjs(this.client.readyTimestamp).tz().format('ddd, DD/MM/YY @HH:MM:A'));
  }

  /**
   * Get the total number of members across all the guilds that the client is connected to.
   * @returns A promise that resolves to the number of [members](https://discord.js.org/#/docs/main/stable/class/GuildMember).
   */
  private getNumberOfMembers(): Promise<string> {
    return Promise.resolve(this.client.guilds.cache.reduce((sum, guild) => sum + guild.memberCount, 0).toString());
  }

  /**
   * Get the number of commands registered to this client.
   * @returns A promise that resolves to the number of commands.
   */
  private getNumberOfCommands(): Promise<string> {
    return Promise.resolve(this.client.registry.commands.reduce((sum) => sum + 1, 0).toString());
  }
}

export default PresenceTemplater;
