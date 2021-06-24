import Discord from 'discord.js';

interface CommandInfo {
  name: string,
  emoji?: string,
  group: string,
  description: string,
  guildOnly?: boolean,
  ownerOnly?: boolean,
  userPermissions?: Discord.PermissionResolvable,
  ownerOverride?: boolean,
  nsfw?: boolean
}

export default CommandInfo;
