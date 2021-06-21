import logger from '@greencoast/logger';
import ExtendedClient from '../ExtendedClient';
import PresenceTemplater from './PresenceTemplater';
import PresenceManagerOptions from '../../interfaces/PresenceManagerOptions';
import PresenceData from '../../interfaces/PresenceData';

/**
 * A class to manage the client's presence statuses.
 */
class PresenceManager {
  public readonly client: ExtendedClient;
  public readonly templater: PresenceTemplater;
  public options: PresenceManagerOptions;

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
}

export default PresenceManager;
