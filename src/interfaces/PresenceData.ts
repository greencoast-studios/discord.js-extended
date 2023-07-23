import { PresenceStatusData } from 'discord.js';
import { ActivityType } from 'discord-api-types/v10';

/**
 * The data to be passed to the presence manager's update method.
 */
export interface PresenceData {
  /**
   * The [activity type](https://discord-api-types.dev/api/discord-api-types-v10/enum/ActivityType) to be used.
   * @defaultValue `ActivityType.Playing`
   */
  type?: Exclude<ActivityType, ActivityType.Custom>,

  /**
   * The [presence status data](https://old.discordjs.dev/#/docs/discord.js/main/typedef/PresenceStatusData) to be used.
   * @defaultValue `online`
   */
  status?: PresenceStatusData,

  /**
   * Whether the presence should display the client is AFK.
   * @defaultValue `false`
   */
  afk?: boolean
}
