import { Guild, Message, GuildMember } from 'discord.js';
import logger from '@greencoast/logger';
import Command from '../command/Command';
import CommandGroup from '../command/CommandGroup';
import { CommandTrigger } from '../../types';
import SlashCommand from '../command/SlashCommand';

/**
 * The default event handlers for the custom events of {@link ExtendedClient}.
 */
class ExtraClientDefaultHandlers {
  /**
   * Log that a data provider has been added to the client.
   */
  static onDataProviderAdd(): void {
    logger.info('Added data provider to client.');
  }

  /**
   * Log that the data provider has cleared the data for a guild or on the global scope.
   * @param guild The [guild](https://discord.js.org/#/docs/discord.js/stable/class/Guild) for which
   * the data has been cleared.
   */
  static onDataProviderClear(guild: Guild | null): void {
    logger.warn(`Cleared data in data provider for ${guild?.name || 'global keys'}.`);
  }

  /**
   * Log that the data provider has been initialized.
   */
  static onDataProviderInit(): void {
    logger.info('DataProvider has been initialized.');
  }

  /**
   * Log that the data provider has been destroyed.
   */
  static onDataProviderDestroy(): void {
    logger.warn('DataProvider has been destroyed.');
  }

  /**
   * Logged who executed a command and in which guild.
   * @param command The command that was executed.
   * @param trigger The [message](https://discord.js.org/#/docs/discord.js/stable/class/Message) or
   * [interaction](https://discord.js.org/#/docs/discord.js/stable/class/Interaction) that
   * triggered the command execution.
   */
  static onCommandExecute(command: Command<CommandTrigger>, trigger: CommandTrigger): void {
    if (trigger instanceof Message) {
      logger.info(`User ${trigger.member?.displayName || trigger.author.username} issued command ${command.name} in ${trigger.guild?.name || 'DM'}`);
    } else {
      const authorDisplayName = trigger.member instanceof GuildMember ?
        trigger.member.displayName :
        trigger.member?.nick;

      logger.info(`User ${authorDisplayName || trigger.user.username} issued command ${command.name} in ${trigger.guild?.name || 'DM'}`);
    }
  }

  /**
   * Log that a command has thrown an error.
   * @param error The error that was thrown in the command's run method.
   * @param command The command that was executed.
   * @param trigger The [message](https://discord.js.org/#/docs/discord.js/stable/class/Message) or
   * [interaction](https://discord.js.org/#/docs/discord.js/stable/class/Interaction) that
   * triggered the command execution.
   */
  static onCommandError(error: unknown, command: Command<CommandTrigger>, trigger: CommandTrigger): void {
    logger.error(`Something happened when executing ${command.name} in ${trigger.guild?.name || 'DM'}.`);

    if (trigger instanceof Message) {
      logger.error(`Triggering message: ${trigger.content}`);
    } else {
      logger.error(`Triggering interaction had an ID of ${trigger.id}`);
    }

    logger.error(error);
  }

  /**
   * Log that a group has been registered to the client.
   * @param group The command group that was registered.
   */
  static onGroupRegistered(group: CommandGroup): void {
    logger.info(`Registered ${group.name} (id: ${group.id}) command group.`);
  }

  /**
   * Log that a command has been registered to the client.
   * @param command The command that was registered.
   */
  static onCommandRegistered(command: Command<CommandTrigger>): void {
    logger.info(`Registered ${command.name} in ${command.group?.name}.`);
  }

  /**
   * Log that the client's presence has been updated.
   * @param status The presence status.
   */
  static onPresenceUpdated(status: string): void {
    logger.info(`Presence updated to: ${status}`);
  }

  /**
   * Log the error that was thrown while updating the client's presence.
   * @param error The error that was thrown.
   */
  static onPresenceUpdateError(error: unknown): void {
    logger.error('Could not update presence!');
    logger.error(error);
  }

  /**
   * Log that the presence manager's refresh interval has been updated.
   * @param interval The new presence manager's refresh interval.
   */
  static onPresenceRefreshInterval(interval: number | null): void {
    if (!interval) {
      logger.info('Refresh interval has been disabled.');
      return;
    }

    logger.info(`Refresh interval updated, presence will be updated every ${interval}ms.`);
  }

  static onCommandsDeployed(commands: SlashCommand[], guildID: string | null): void {
    if (guildID) {
      logger.info(`Successfully deployed ${commands.length} slash commands to ${guildID}`);
    } else {
      logger.info(`Successfully deployed ${commands.length} slash commands globally. This change may take up to 1 hour to take effect.`);
    }
  }
}

export default ExtraClientDefaultHandlers;
