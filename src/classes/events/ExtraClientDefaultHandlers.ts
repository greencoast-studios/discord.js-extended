import Discord from 'discord.js';
import logger from '@greencoast/logger';
import Command from '../command/Command';
import CommandGroup from '../command/CommandGroup';

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
   * @param guild The [guild](https://discord.js.org/#/docs/main/stable/class/Guild) for which
   * the data has been cleared.
   */
  static onDataProviderClear(guild: Discord.Guild | null): void {
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
   * @param message The [message](https://discord.js.org/#/docs/main/stable/class/Message) that
   * triggered the command execution.
   */
  static onCommandExecute(command: Command, message: Discord.Message): void {
    logger.info(`User ${message.member?.displayName || message.author.username} issued command ${command.name} in ${message.guild?.name || 'DM'}`);
  }

  /**
   * Log that a command has thrown an error.
   * @param error The error that was thrown in the command's run method.
   * @param command The command that was executed.
   * @param message The [message](https://discord.js.org/#/docs/main/stable/class/Message) that
   * triggered the command execution.
   */
  static onCommandError(error: Error, command: Command, message: Discord.Message): void {
    logger.error(`Something happened when executing ${command.name} in ${message.guild?.name || 'DM'}.`);
    logger.error(`Triggering message: ${message.content}`);
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
  static onCommandRegistered(command: Command): void {
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
  static onPresenceUpdateError(error: Error): void {
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
}

export default ExtraClientDefaultHandlers;
