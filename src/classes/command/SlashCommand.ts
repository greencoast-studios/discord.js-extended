/* eslint-disable max-statements */
/* eslint-disable max-len */
import Discord from 'discord.js';
import _ from 'lodash';
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
abstract class SlashCommand extends Command<Discord.CommandInteraction> {
  /**
   * The data builder for this slash command.
   * You do not need to set its name or description, the constructor
   * will automatically set these based on the command info.
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
   * Get this command's data builder.
   * @returns This command's data builder.
   */
  public getDataBuilder(): SlashCommandBuilder {
    return this.dataBuilder;
  }

  /**
   * Get all the data builders associated to this command.
   * This includes a copy of the original dataBuilder for each
   * command alias.
   * @returns An array of this command's data builders.
   */
  public getAllDataBuilders(): SlashCommandBuilder[] {
    const aliasBuilders = this.aliases.map((alias) => {
      const builder: SlashCommandBuilder = _.cloneDeep(this.dataBuilder);
      builder.setName(alias);
      return builder;
    });

    return [this.getDataBuilder(), ...aliasBuilders];
  }

  /**
   * Abstract method. You need to implement this method in order for the command to work. This defines the execution behavior of the command.
   * @param interaction The [interaction](https://discord.js.org/#/docs/discord.js/stable/class/CommandInteraction) that triggered this command.
   */
  public abstract run(interaction: Discord.CommandInteraction): Promise<Discord.Message | void>;

  /**
   * Check whether the interaction author can execute this command.
   * @param interaction The [interaction](https://discord.js.org/#/docs/discord.js/stable/class/CommandInteraction) that triggered this command.
   * @returns `true` if the user has enough permissions, or a string with the reason why they cannot execute this command.
   */
  public override hasPermission(interaction: Discord.CommandInteraction): boolean | string {
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
   * @param interaction The [interaction](https://discord.js.org/#/docs/discord.js/stable/class/CommandInteraction) that triggered this command.
   * @returns A promise that resolves the message that was replied to the original message author (if available).
   * @emits `client#commandError`
   */
  public override async onError(error: unknown, interaction: Discord.CommandInteraction): Promise<Discord.Message | void> {
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

    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({
        content: `An error has occurred when running the command ${this.name}.${contactOwner}`
      });
    } else {
      await interaction.reply({
        content: `An error has occurred when running the command ${this.name}.${contactOwner}`
      });
    }
  }
}

export default SlashCommand;
