import { PresenceStatusData } from 'discord.js';
import { ActivityType } from 'discord-api-types/v10';

/**
 * The data to be passed to the presence manager's update method.
 */
interface PresenceData {
  /**
   * The [activity type](https://discord.js.org/#/docs/main/stable/typedef/ActivityType) to be used.
   * @defaultValue `PLAYING`
   */
  type?: Exclude<ActivityType, ActivityType.Custom>,

  /**
   * The [presence status data](https://discord.js.org/#/docs/main/stable/typedef/PresenceStatusData) to be used.
   * @defaultValue `online`
   */
  status?: PresenceStatusData,

  /**
   * Whether the presence should display the client is AFK.
   * @defaultValue `false`
   */
  afk?: boolean
}

export default PresenceData;
