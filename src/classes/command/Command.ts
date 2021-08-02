import Discord from 'discord.js';
import { stripIndents } from 'common-tags';
import ExtendedClient from '../ExtendedClient';
import CommandGroup from './CommandGroup';
import CommandInfo from '../../interfaces/CommandInfo';

/**
 * An abstract command class. Extend this class to define your command's functionality.
 */
abstract class Command {
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
   * defines the permissions that an user requires to execute this command.
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
   * Abstract method. You need to implement this method in order for the command to work. This defines the execution behavior of the command.
   * @param message The [message](https://discord.js.org/#/docs/main/stable/class/Message) that triggered this command.
   * @param args The arguments passed to this command.
   */
  public abstract run(message: Discord.Message, args: string[]): Promise<Discord.Message>;

  /**
   * Check whether the message author can execute this command.
   * @param message The [message](https://discord.js.org/#/docs/main/stable/class/Message) that triggered this command.
   * @returns `true` if the user has enough permissions, or a string with the reason why they cannot execute this command.
   */
  public hasPermission(message: Discord.Message): boolean | string {
    if (!this.ownerOnly && !this.userPermissions) {
      return true;
    }

    if (this.ownerOverride && this.client.isOwner(message.author)) {
      return true;
    }

    if (this.ownerOnly && !this.client.isOwner(message.author)) {
      return `The command ${this.name} may only be used by the bot's owner.`;
    }

    if (this.userPermissions && message.channel instanceof Discord.TextChannel) {
      const missingPermissions = message.channel.permissionsFor(message.author)?.missing(this.userPermissions);

      if (!missingPermissions || missingPermissions.length < 1) {
        return true;
      }

      if (missingPermissions.length === 1) {
        return `The command ${this.name} requires you to have ${missingPermissions[0]} permission.`;
      }

      return `The command ${this.name} requires you to have ${missingPermissions.join(', ')} permissions.`;
    }

    return true;
  }

  /**
   * Handle command error.
   * @param error The error that was thrown inside the command's run method.
   * @param message The [message](https://discord.js.org/#/docs/main/stable/class/Message) that triggered this command.
   * @returns A promise that resolves the message that was replied to the original message author.
   * @emits `client#commandError`
   */
  public async onError(error: Error, message: Discord.Message): Promise<Discord.Message> {
    this.client.emit('commandError', error, this, message);

    let contactOwner = '';
    if (this.client.owner) {
      contactOwner = ` If you've received this message, contact ${this.client.owner}.`;

      if (this.client.errorOwnerReporting) {
        await this.client.owner.send(stripIndents`
        Something happened when executing **${this.name}** in **${message.guild?.name || 'DM'}**. The command was executed by **${message.member?.displayName || message.author.username}** with the following content:

        \`\`\`
        ${message.content}
        \`\`\`
        The error that ocurred:

        \`\`\`
        ${error.stack || error.message}
        \`\`\`
        `);
      }
    }

    return message.reply(`An error has ocurred when running the command ${this.name}.${contactOwner}`);
  }
}

export default Command;
