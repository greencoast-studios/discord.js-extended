/* eslint-disable max-statements */
import { ActivityType } from 'discord-api-types/v10';
import ExtendedClient from '../ExtendedClient';
import PresenceTemplater from './PresenceTemplater';
import { randomArrayItem } from '../../utils/array';
import PresenceManagerOptions from '../../interfaces/PresenceManagerOptions';
import PresenceData from '../../interfaces/PresenceData';

/**
 * A class to manage the client's presence statuses.
 */
class PresenceManager {
  /**
   * The client that this presence manager will be used by.
   * @type {ExtendedClient}
   * @memberof PresenceManager
   */
  public readonly client: ExtendedClient;

  /**
   * The presence templater used by this presence manager.
   * @type {PresenceTemplater}
   * @memberof PresenceManager
   */
  public readonly templater: PresenceTemplater;

  /**
   * The options for this presence manager.
   * @type {PresenceManagerOptions}
   * @memberof PresenceManager
   * @defaultValue
   * ```js
   * {
   *   templates: ['{num_guilds} servers!'],
   *   status: 'online',
   *   type: 'PLAYING',
   *   afk: false
   * }
   * ```
   */
  public options: PresenceManagerOptions;

  /**
   * The refresh interval handle for this presence manager.
   * @private
   * @type {(NodeJS.Timeout | null)}
   * @memberof PresenceManager
   */
  private refreshIntervalHandle: NodeJS.Timeout | null;

  /**
   * @param client The client that this presence manager will be used by.
   * @param options The options for this presence manager.
   */
  constructor(client: ExtendedClient, options: PresenceManagerOptions = {}) {
    if (!options.templates) {
      options.templates = ['{num_guilds} servers!'];
    }
    if (!options.status) {
      options.status = 'online';
    }
    if (!options.type) {
      options.type = ActivityType.Playing;
    }
    if (!options.afk) {
      options.afk = false;
    }
    if (!options.customGetters) {
      options.customGetters = {};
    }

    this.client = client;
    this.templater = new PresenceTemplater(client, options.customGetters);

    this.options = options;
    this.refreshIntervalHandle = null;

    if (!client.uptime) {
      client.once('ready', () => {
        this.setRefreshInterval(options.refreshInterval);
      });
    } else {
      this.setRefreshInterval(options.refreshInterval);
    }
  }

  /**
   * Update the client's presence.
   * @param status The status message to set. It can be a templated message. See {@link PresenceTemplater}.
   * @param data Additional data to pass to the presence updater.
   * @returns A promise that resolves on presence update.
   * @emits `client#presenceUpdated`
   * @emits `client#presenceUpdateError`
   */
  public async update(status: string, data: PresenceData = {}): Promise<void> {
    const processedStatus = await this.templater.apply(status);
    const presenceData = { ...this.options, ...data };

    try {
      this.client.user?.setPresence({
        activities: [{
          name: processedStatus,
          type: presenceData.type
        }],
        status: presenceData.status,
        afk: presenceData.afk
      });

      this.client.emit('presenceUpdated', processedStatus, presenceData);
    } catch (error) {
      this.client.emit('presenceUpdateError', error, processedStatus, presenceData);
    }
  }

  /**
   * Set the refresh interval at which the presences should update.
   * The presences that are used are the ones specified in the templates option.
   * @param refreshInterval The interval at which the presences should update. Must be a positive integer.
   * @throws Throws if the interval is not positive.
   * @emits `client#presenceRefreshInterval`
   */
  public setRefreshInterval(refreshInterval: number | null = null): void {
    if (!refreshInterval) {
      this.options.refreshInterval = null;

      if (this.refreshIntervalHandle) {
        clearInterval(this.refreshIntervalHandle);
      }
      this.refreshIntervalHandle = null;

      this.client.emit('presenceRefreshInterval', this.options.refreshInterval);

      return;
    }

    if (refreshInterval < 0) {
      throw new Error('Interval should be a positive integer!');
    }

    this.options.refreshInterval = refreshInterval;

    if (this.refreshIntervalHandle) {
      clearInterval(this.refreshIntervalHandle);
    }

    this.randomlyUpdate();
    this.refreshIntervalHandle = setInterval(() => this.randomlyUpdate(), refreshInterval);

    this.client.emit('presenceRefreshInterval', this.options.refreshInterval);
  }

  /**
   * Update the client's presence with a presence randomly chosen from the templates specified.
   * @returns Promise that resolves on presence update.
   * @emits `client#presenceUpdated`
   * @emits `client#presenceUpdateError`
   */
  public randomlyUpdate(): Promise<void> {
    return this.update(randomArrayItem(this.options.templates!));
  }
}

export default PresenceManager;
