import Discord from 'discord.js';
import logger from '@greencoast/logger';
import { stripIndents } from 'common-tags';
import ExtendedClient from '../ExtendedClient';
import CommandGroup from './CommandGroup';
import CommandInfo from '../../interfaces/CommandInfo';

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

  public abstract run(message: Discord.Message, args: string[]): Promise<Discord.Message>;

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

  public async onError(error: Error, message: Discord.Message): Promise<Discord.Message> {
    logger.error(`Something happened when executing ${this.name} in ${message.guild?.name || 'DM'}.`);
    logger.error(`Triggering message: ${message.content}`);
    logger.error(error);

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
