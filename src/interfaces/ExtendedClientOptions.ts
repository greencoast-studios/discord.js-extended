import Discord from 'discord.js';
import ConfigProvider from '../classes/config/ConfigProvider';
import PresenceManagerOptions from './PresenceManagerOptions';

interface ExtendedClientOptions extends Discord.ClientOptions {
  prefix?: string,
  owner?: string | null,
  debug?: boolean,
  presence?: PresenceManagerOptions,
  config?: ConfigProvider,
  errorOwnerReporting?: boolean
}

export default ExtendedClientOptions;
