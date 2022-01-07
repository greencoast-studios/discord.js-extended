import Discord from 'discord.js';
import ExtendedClient from '../ExtendedClient';
import CommandGroup from './CommandGroup';
import CommandInfo from '../../interfaces/CommandInfo';
import { CommandTrigger } from '../../types';

/**
 * An abstract base command class. You should probably not extend this yourself
 * and instead should extend {@link RegularCommand} or {@link SlashCommand}.
 */
abstract class Command<T extends CommandTrigger> {
  /**
   * The client that this command will be used by.
   * @type {ExtendedClient}
   * @memberof Command
   */
  public readonly client: ExtendedClient;

  /**
   * The name of this command.
   * @type {string}
   * @memberof Command
   */
  public name: string;

  /**
   * The emoji of this command. This is used by the default {@link HelpCommand}.
   * @type {string}
   * @memberof Command
   * @defaultValue 🤖
   */
  public emoji: string;

  /**
   * The group that this command is registered to.
   * @remarks This gets initialized on command registration.
   * @type {(CommandGroup | null)}
   * @memberof Command
   */
  public group: CommandGroup | null;

  /**
   * The ID of the group that this command is registered to.
   * @type {string}
   * @memberof Command
   */
  public groupID: string;

  /**
   * The description of this command.
   * @type {string}
   * @memberof Command
   */
  public description: string;

  /**
   * Whether this command may only be used in a guild.
   * @type {boolean}
   * @memberof Command
   * @defaultValue `false`
   */
  public guildOnly: boolean;

  /**
   * Whether this command may only be used by the bot's owner.
   * @type {boolean}
   * @memberof Command
   * @defaultValue `false`
   */
  public ownerOnly: boolean;

  /**
   * The [permissions resolvable](https://discord.js.org/#/docs/main/stable/typedef/PermissionResolvable) that
   * defines the permissions that a user requires to execute this command.
   * @type {(Discord.PermissionResolvable | null)}
   * @memberof Command
   * @defaultValue `null`
   */
  public userPermissions: Discord.PermissionResolvable | null;

  /**
   * Whether the bot's owner can execute this command even if they don't have the required permissions.
   * @type {boolean}
   * @memberof Command
   * @defaultValue `true`
   */
  public ownerOverride: boolean;

  /**
   * Whether this command may only be used in a NSFW channel.
   * @type {boolean}
   * @memberof Command
   * @defaultValue `false`
   */
  public nsfw: boolean;

  /**
   * Aliases for this command.
   * @type {string[]}
   * @memberof Command
   * @defaultValue `[]`
   */
  public aliases: string[];

  /**
   * @param client The client that this command will be used by.
   * @param info This command's specific information.
   */
  constructor(client: ExtendedClient, info: CommandInfo) {
    this.client = client;

    this.name = info.name;
    this.emoji = info.emoji || ':robot:';
    this.group = null;
    this.groupID = info.group;
    this.description = info.description;
    this.guildOnly = info.guildOnly || false;
    this.ownerOnly = info.ownerOnly || false;
    this.userPermissions = info.userPermissions || null;
    this.ownerOverride = info.ownerOverride || true;
    this.nsfw = info.nsfw || false;
    this.aliases = info.aliases || [];
  }

  /**
   * Check whether the message author can execute this command.
   * @param trigger The [message](https://discord.js.org/#/docs/main/stable/class/Message) or
   * [interaction](https://discord.js.org/#/docs/main/stable/class/Interaction) that triggered this command.
   * @returns `true` if the user has enough permissions, or a string with the reason why they cannot execute this command.
   */
  public abstract hasPermission(trigger: T): boolean | string;

  /**
   * Handle command error.
   * @param error The error that was thrown inside the command's run method.
   * @param trigger The [message](https://discord.js.org/#/docs/main/stable/class/Message) or
   * [interaction](https://discord.js.org/#/docs/main/stable/class/Interaction) that triggered this command.
   * @returns A promise that resolves the message that was replied to the original message author.
   * @emits `client#commandError`
   */
  public abstract onError(error: unknown, trigger: T): Promise<Discord.Message>;
}

export default Command;
