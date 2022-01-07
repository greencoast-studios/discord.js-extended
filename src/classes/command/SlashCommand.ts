/* eslint-disable max-statements */
import Discord from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { stripIndents } from 'common-tags';
import ExtendedClient from '../ExtendedClient';
import Command from './Command';
import SlashCommandInfo from '../../interfaces/SlashCommandInfo';
import SlashCommandValidator from './SlashCommandValidator';

/**
 * An abstract interaction based command class. Extend this class to define your command's functionality.
 * This class serves as a base for interaction based commands (slash commands).
 */
abstract class SlashCommand extends Command<Discord.Interaction> {
  /**
   * The data builder for this slash command.
   * @type SlashCommandBuilder
   * @memberof SlashCommand
   */
  public dataBuilder: SlashCommandBuilder;

  /**
   * @param client The client that this command will be used by.
   * @param info This command's specific information.
   * @throws Throws if no `info.dataBuilder` is not specified.
   */
  constructor(client: ExtendedClient, info: SlashCommandInfo) {
    if (!info.dataBuilder) {
      throw new Error('Data builder is required for any slash command!');
    }

    super(client, info);

    SlashCommandValidator.validate(this);

    this.dataBuilder = info.dataBuilder;

    this.dataBuilder.setName(info.name);
    this.dataBuilder.setDescription(info.description);
  }

  /**
   * Abstract method. You need to implement this method in order for the command to work. This defines the execution behavior of the command.
   * @param interaction The [interaction](https://discord.js.org/#/docs/main/stable/class/Interaction) that triggered this command.
   */
  public abstract run(interaction: Discord.Interaction): Promise<Discord.Message>;

  /**
   * Check whether the interaction author can execute this command.
   * @param interaction The [interaction](https://discord.js.org/#/docs/main/stable/class/Interaction) that triggered this command.
   * @returns `true` if the user has enough permissions, or a string with the reason why they cannot execute this command.
   */
  public override hasPermission(interaction: Discord.Interaction): boolean | string {
    if (!this.ownerOnly && !this.userPermissions) {
      return true;
    }

    if (this.ownerOverride && this.client.isOwner(interaction.user)) {
      return true;
    }

    if (this.ownerOnly && !this.client.isOwner(interaction.user)) {
      return `The command ${this.name} may only be used by the bot's owner.`;
    }

    if (this.userPermissions && interaction.channel) {
      if (interaction.channel instanceof Discord.DMChannel || interaction.channel.partial) {
        return true;
      }

      const missingPermissions = interaction.channel.permissionsFor(interaction.user)?.missing(this.userPermissions);

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
   * @param interaction The [interaction](https://discord.js.org/#/docs/main/stable/class/Interaction) that triggered this command.
   * @returns A promise that resolves the message that was replied to the original message author.
   * @emits `client#commandError`
   */
  public override async onError(error: unknown, interaction: Discord.Interaction): Promise<Discord.Message> {
    this.client.emit('commandError', error, this, interaction);

    let contactOwner = '';
    if (this.client.owner) {
      contactOwner = ` If you've received this message, contact ${this.client.owner}.`;

      if (this.client.errorOwnerReporting) {
        const authorDisplayName = interaction.member instanceof Discord.GuildMember ?
          interaction.member.displayName :
          interaction.member?.nick;

        await this.client.owner.send(stripIndents`
        Something happened when executing **${this.name}** in **${interaction.guild?.name || 'DM'}**. The command was executed by **${authorDisplayName || interaction.user.username}** from interaction ${interaction.id}:

        The error that occurred:

        \`\`\`
        ${error instanceof Error ? error.stack || error.message : error}
        \`\`\`
        `);
      }
    }

    // Can safely non-null assert because this function handles implicitly command interactions that should have a channel.
    return interaction.channel!.send(`An error has occurred when running the command ${this.name}.${contactOwner}`);
  }
}

export default SlashCommand;
