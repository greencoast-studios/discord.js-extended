import { Message, DMChannel } from 'discord.js';
import { stripIndents } from 'common-tags';
import { Command } from './Command';

/**
 * An abstract message based command class. Extend this class to define your command's functionality.
 * This class serves as a base for message based commands. You should always prefer to use {@link SlashCommand}
 * instead of this one.
 */
export abstract class RegularCommand extends Command<Message> {
  /**
   * Abstract method. You need to implement this method in order for the command to work. This defines the execution behavior of the command.
   * @param message The [message](https://old.discordjs.dev/#/docs/discord.js/main/class/Message) that triggered this command.
   * @param args The arguments passed to this command.
   */
  public abstract run(message: Message, args: string[]): Promise<void>;

  /**
   * Check whether the message author can execute this command.
   * @param message The [message](https://old.discordjs.dev/#/docs/discord.js/main/class/Message) that triggered this command.
   * @returns `true` if the user has enough permissions, or a string with the reason why they cannot execute this command.
   */
  public override hasPermission(message: Message): boolean | string {
    if (!this.ownerOnly && !this.userPermissions) {
      return true;
    }

    if (this.ownerOverride && this.client.isOwner(message.author)) {
      return true;
    }

    if (this.ownerOnly && !this.client.isOwner(message.author)) {
      return `The command ${this.name} may only be used by the bot's owner.`;
    }

    if (this.userPermissions && message.channel.isTextBased()) {
      if (message.channel instanceof DMChannel || message.channel.partial) {
        return true;
      }

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
   * @param message The [message](https://old.discordjs.dev/#/docs/discord.js/main/class/Message) that triggered this command.
   * @emits `client#commandError`
   */
  public override async onError(error: unknown, message: Message): Promise<void> {
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
        The error that occurred:

        \`\`\`
        ${error instanceof Error ? error.stack || error.message : error}
        \`\`\`
        `);
      }
    }

    await message.reply(`An error has occurred when running the command ${this.name}.${contactOwner}`);
  }
}
