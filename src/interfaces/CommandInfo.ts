import { PermissionResolvable } from 'discord.js';

/**
 * The command's information object. This defines the command's properties.
 */
interface CommandInfo {
  /**
   * The command's name.
   */
  name: string,

  /**
   * An emoji that represents the command. This is used by the default {@link HelpCommand}.
   * @defaultValue 🤖
   */
  emoji?: string,

  /**
   * The ID of the group that this command is registered to.
   */
  group: string,

  /**
   * The command's description.
   */
  description: string,

  /**
   * Whether the command may only be used in a guild.
   * @defaultValue `false`
   */
  guildOnly?: boolean,

  /**
   * Whether the command may only be used by the client's owner.
   * @defaultValue `false`
   */
  ownerOnly?: boolean,

  /**
   * The [permissions resolvable](https://discord.js.org/#/docs/main/stable/typedef/PermissionResolvable) that
   * defines the permissions that a user requires to execute this command.
   * @defaultValue `null`
   */
  userPermissions?: PermissionResolvable,

  /**
   * Whether the bot's owner can execute this command even if they don't have the required permissions.
   * @defaultValue `true`
   */
  ownerOverride?: boolean,

  /**
   * Whether this command may only be used in a NSFW channel.
   * @defaultValue `false`
   */
  nsfw?: boolean,

  /**
   * Aliases for this command.
   * @defaultValue `[]`
   */
  aliases?: string[]
}

export default CommandInfo;
