import Discord from 'discord.js';
import ConfigProvider from '../classes/config/ConfigProvider';
import PresenceManagerOptions from './PresenceManagerOptions';

/**
 * The options used to create a {@link ExtendedClient}.
 */
interface ExtendedClientOptions extends Discord.ClientOptions {
  /**
   * The client's prefix.
   * @defaultValue `!`
   */
  prefix?: string,

  /**
   * The ID of the client's owner.
   * @defaultValue `null`
   */
  owner?: string | null,

  /**
   * Whether the client has debug-mode enabled.
   * @defaultValue `false`
   */
  debug?: boolean,

  /**
   * The client's presence manager's options.
   * @defaultValue The {@link PresenceManagerOptions} defaults.
   */
  presence?: PresenceManagerOptions,

  /**
   * The client's config provider.
   */
  config?: ConfigProvider,

  /**
   * Whether command error reporting should be notified to the client's owner.
   * An owner must be set for this option to work.
   * @defaultValue `false`
   */
  errorOwnerReporting?: boolean,

  /**
   * The ID of the guild used to test this bot. It is not required, however
   * it is recommended to specify one. This is used to automatically deploy
   * slash commands to the testing guild.
   */
  testingGuildID?: string
}

export default ExtendedClientOptions;
