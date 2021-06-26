import humanizeDuration from 'humanize-duration';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import ExtendedClient from '../ExtendedClient';
import Templater from '../abstract/Templater';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * A templater class to help with the application of templates for presence statuses.
 *
 * Supported templates:
 *
 * | Template         | Replaced by                                                                                                                 |
 * |------------------|-----------------------------------------------------------------------------------------------------------------------------|
 * | `{num_guild}`    | Get the number of guilds the client is connected to.                                                                        |
 * | `{prefix}`       | Get the prefix used by the client.                                                                                          |
 * | `{cur_time}`     | Get the current time in the client's locale.                                                                                |
 * | `{owner_name}`   | Get the owner's name. If no owner is specified then it returns `undefined`.                                                 |
 * | `{client_name}`  | Get the client's name. If the client's user is not ready yet then it returns `undefined`.                                   |
 * | `{uptime}`       | Get the client's uptime since last ready event emitted in a human-readable shape. Returns `null` if no uptime is available. |
 * | `{ready_time}`   | Get the client's time at which the last ready event was emitted. Returns `null` if no `readyAt` timestamp is available.     |
 * | `{num_members}`  | Get the total number of members across all the guilds that the client is connected to.                                      |
 * | `{num_commands}` | Get the number of commands registered to this client.                                                                       |
 */
class PresenceTemplater extends Templater {
  /**
   * The client that this presence templater will use as a data source.
   * @type {ExtendedClient}
   * @memberof PresenceTemplater
   */
  public readonly client: ExtendedClient;

  /**
   * @param client The client that this presence templater will use as a data source.
   * @throws Throws if given key does not correspond to this templater.
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
      case 'uptime':
        return this.getUptime();
      case 'ready_time':
        return this.getReadyTime();
      case 'num_members':
        return this.getNumberOfMembers();
      case 'num_commands':
        return this.getNumberOfCommands();
      default:
        throw new Error('Unknown key inserted in PresenceTemplater.');
    }
  }

  /**
   * Get the number of guilds the client is connected to.
   * @returns The number of [guilds](https://discord.js.org/#/docs/main/stable/class/Guild).
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
    return dayjs(new Date().getTime()).tz().format('hh:mm:ss A');
  }

  /**
   * Get the owner's name. If no owner is specified then it returns `undefined`.
   * @returns The owner's name.
   */
  private getOwnerName(): string {
    return this.client.owner?.username || 'undefined';
  }

  /**
   * Get the client's name. If the client's user is not ready yet then it returns `undefined`.
   * @returns The client's name.
   */
  private getClientName(): string {
    return this.client.user?.username || 'undefined';
  }

  /**
   * Get the client's uptime since last ready event emitted in a human-readable shape.
   * Returns `null` if no uptime is available.
   * @returns The client's uptime.
   */
  private getUptime(): string {
    if (!this.client.uptime) {
      return 'null';
    }

    return humanizeDuration(this.client.uptime, {
      largest: 3,
      units: ['d', 'h', 'm'],
      round: true,
      conjunction: ' and ',
      serialComma: false
    });
  }

  /**
   * Get the client's time at which the last ready event was emitted. Returns `null`
   * if no `readyAt` timestamp is available.
   * @returns The time the client has gone ready.
   */
  private getReadyTime(): string {
    if (!this.client.readyTimestamp) {
      return 'null';
    }

    return dayjs(this.client.readyTimestamp).tz().format('ddd, DD/MM/YY @HH:MM:A');
  }

  /**
   * Get the total number of members across all the guilds that the client is connected to.
   * @returns The number of [members](https://discord.js.org/#/docs/main/stable/class/GuildMember).
   */
  private getNumberOfMembers(): string {
    return this.client.guilds.cache.reduce((sum, guild) => sum + guild.memberCount, 0).toString();
  }

  /**
   * Get the number of commands registered to this client.
   * @returns The number of commands.
   */
  private getNumberOfCommands(): string {
    return this.client.registry.commands.reduce((sum) => sum + 1, 0).toString();
  }
}

export default PresenceTemplater;
