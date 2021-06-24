import Discord from 'discord.js';
import { stripIndents } from 'common-tags';
import ExtendedClient from '../ExtendedClient';
import CommandGroup from './CommandGroup';
import CommandInfo from '../../interfaces/CommandInfo';

/**
 * An abstract command class. Extend this class to define your command's functionality.
 */
abstract class Command {
  public readonly client: ExtendedClient;
  public name: string;
  public emoji: string;
  public group: CommandGroup | null;
  public groupID: string;
  public description: string;
  public guildOnly: boolean;
  public ownerOnly: boolean;
  public userPermissions: Discord.PermissionResolvable | null;
  public ownerOverride: boolean;
  public nsfw: boolean;

  /**
   * @param client The client that will execute this command.
   * @param info Command-specific properties.
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
  }

  /**
   * Abstract method. You need to implement this method in order for the command to work. This defines the execution behavior of the command.
   * @param message The message that triggered this command.
   * @param args The arguments passed to this command.
   */
  public abstract run(message: Discord.Message, args: string[]): Promise<Discord.Message>;

  /**
   * Check whether the message author can execute this command.
   * @param message The message that triggered this command.
   * @returns True if the user has enough permissions, or a string with the reason they cannot execute this command.
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
   * @param message The message that triggered this command.
   * @returns A promise that resolves the message that was replied to the message author.
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
