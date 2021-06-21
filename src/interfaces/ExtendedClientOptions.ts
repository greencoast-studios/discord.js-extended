import Discord from 'discord.js';

interface ExtendedClientOptions extends Discord.ClientOptions {
  prefix?: string,
  owner?: string | null,
  debug?: boolean
}

export default ExtendedClientOptions;
