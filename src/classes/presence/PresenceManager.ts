/* eslint-disable max-statements */
import logger from '@greencoast/logger';
import ExtendedClient from '../ExtendedClient';
import PresenceTemplater from './PresenceTemplater';
import { randomArrayItem } from '../../utils/array';
import PresenceManagerOptions from '../../interfaces/PresenceManagerOptions';
import PresenceData from '../../interfaces/PresenceData';

/**
 * A class to manage the client's presence statuses.
 */
class PresenceManager {
  public readonly client: ExtendedClient;
  public readonly templater: PresenceTemplater;
  public options: PresenceManagerOptions;
  private refreshIntervalHandle: NodeJS.Timeout | null;

  /**
   * @param client The ExtendedClient for this PresenceManager.
   * @param options The options for this PresenceManager.
   */
  constructor(client: ExtendedClient, options: PresenceManagerOptions = {}) {
    this.client = client;
    this.templater = new PresenceTemplater(client);

    if (!options.templates) {
      options.templates = ['{num_guilds} servers!'];
    }
    if (!options.status) {
      options.status = 'online';
    }
    if (!options.type) {
      options.type = 'PLAYING';
    }
    if (!options.afk) {
      options.afk = false;
    }
    this.options = options;
    this.refreshIntervalHandle = null;
    this.setRefreshInterval(options.refreshInterval);
  }

  /**
   * Update the client's presence.
   * @param status The status message to set. It can be a templated message. See {@link PresenceTemplater}.
   * @param data Additional data to pass to the presence updater.
   * @returns Promise that fulfills on presence update.
   */
  public update(status: string, data: PresenceData = {}): Promise<void> | undefined {
    const processedStatus = this.templater.apply(status);
    const presenceData = { ...this.options, ...data };

    return this.client.user?.setPresence({
      activity: {
        name: processedStatus,
        type: presenceData.type
      },
      status: presenceData.status,
      afk: presenceData.afk
    })
      .then(() => {
        logger.info(`Presence updated to: ${processedStatus}`);
      })
      .catch((error) => {
        logger.error('Could not update presence!');
        logger.error(error);
      });
  }

  /**
   * Set the refresh interval at which the presences should update.
   * @param refreshInterval The interval. Must be a positive integer.
   */
  public setRefreshInterval(refreshInterval: number | null = null): void {
    if (!refreshInterval) {
      this.options.refreshInterval = null;
      
      if (this.refreshIntervalHandle) {
        clearInterval(this.refreshIntervalHandle);
      }
      this.refreshIntervalHandle = null;

      this.client.emit('debug', 'Refresh interval has been disabled.');

      return;
    }

    if (refreshInterval < 0) {
      throw new Error('Interval should be a positive integer!');
    }

    this.options.refreshInterval = refreshInterval;

    if (this.refreshIntervalHandle) {
      clearInterval(this.refreshIntervalHandle);
    }
    this.refreshIntervalHandle = setInterval(() => this.randomlyUpdate(), refreshInterval);
    
    this.client.emit('debug', `Refresh interval updated, presence will be updated every ${refreshInterval}ms.`);
  }

  /**
   * Update the client's presence with a presence randomly chosen from the templates specified.
   * @returns Promise that fulfills on presence update.
   */
  private randomlyUpdate(): Promise<void> | undefined {
    return this.update(randomArrayItem(this.options.templates!));
  }
}

export default PresenceManager;
