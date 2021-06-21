import Discord from 'discord.js';
import PresenceManagerOptions from './PresenceManagerOptions';

interface ExtendedClientOptions extends Discord.ClientOptions {
  prefix?: string,
  owner?: string | null,
  debug?: boolean,
  presence?: PresenceManagerOptions
}

export default ExtendedClientOptions;
