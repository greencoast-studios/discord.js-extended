import Discord from 'discord.js';

interface ExtendedClientOptions extends Discord.ClientOptions {
  prefix: string,
  owner?: string,
  debug: boolean
}

export default ExtendedClientOptions;
