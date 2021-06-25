import PresenceData from './PresenceData';

/**
 * The presence manager's options.
 */
interface PresenceManagerOptions extends PresenceData {
  /**
   * The templates to be used by the presence manager refresh updated.
   * For more information, check {@link PresenceTemplater}.
   * @defaultValue `['{num_guilds} servers!']`
   */
  templates?: string[],

  /**
   * The interval at which the client's presence should be updated.
   */
  refreshInterval?: number | null
}

export default PresenceManagerOptions;
