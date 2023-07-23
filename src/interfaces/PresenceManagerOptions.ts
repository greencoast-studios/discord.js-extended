import { PresenceData } from './PresenceData';
import { PresenceTemplaterGetters } from '../types';

/**
 * The presence manager's options.
 */
export interface PresenceManagerOptions extends PresenceData {
  /**
   * The templates to be used by the presence manager refresh updated.
   * For more information, check {@link PresenceTemplater}.
   * @defaultValue `['{num_guilds} servers!']`
   */
  templates?: string[],

  /**
   * The interval at which the client's presence should be updated.
   */
  refreshInterval?: number | null,

  /**
   * An object to map a templater key to a custom getter. The getter function
   * should return a Promise that resolves to the correct string that the
   * templater should replace the key with.
   * @defaultValue `{}`
   */
  customGetters?: PresenceTemplaterGetters
}
