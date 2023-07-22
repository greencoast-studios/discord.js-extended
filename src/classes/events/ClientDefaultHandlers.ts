import { Guild, InvalidRequestWarningData } from 'discord.js';
import logger from '@greencoast/logger';

/**
 * The default event handlers for {@link ExtendedClient}.
 */
class ClientDefaultHandlers {
  /**
   * Log the client's debug messages.
   * @param info The debug info.
   */
  static onDebug(info: string): void {
    logger.debug(info);
  }

  /**
   * Log the client's errors.
   * @param error The client error.
   */
  static onError(error: Error): void {
    logger.error(error);
  }

  /**
   * Log the guild that the client has entered.
   * @param guild The created [guild](https://discord.js.org/#/docs/discord.js/stable/class/Guild).
   */
  static onGuildCreate(guild: Guild): void {
    logger.info(`Joined guild ${guild.name}`);
  }

  /**
   * Log the guild that the client has left.
   * @param guild The deleted [guild](https://discord.js.org/#/docs/discord.js/stable/class/Guild).
   */
  static onGuildDelete(guild: Guild): void {
    logger.info(`Left guild ${guild.name}`);
  }

  /**
   * Log the guild that is currently unavailable.
   * @param guild The unavailable [guild](https://discord.js.org/#/docs/discord.js/stable/class/Guild).
   */
  static onGuildUnavailable(guild: Guild): void {
    logger.warn(`Guild ${guild.name} is unavailable.`);
  }

  /**
   * Log that the client's connection has been invalidated. This method stops the process execution with code 1.
   */
  static onInvalidated(): void {
    logger.fatal('Client connection has been invalidated, exiting with code 1.');
    process.exit(1);
  }

  /**
   * Log whenever the client sends invalid data to Discord. You should avoid sending over 10k invalid requests
   * to Discord in less than 10 minutes to avoid a ban.
   * @param data The invalid request information.
   */
  static onInvalidRequestWarning(data: InvalidRequestWarningData): void {
    logger.warn('Invalid data sent to Discord!');
    logger.warn(data);
  }

  /**
   * Log the client's ready message.
   */
  static onReady(): void {
    logger.info('Connected to Discord! - Ready.');
  }

  /**
   * Log the client's warning messages.
   * @param info The client's warning.
   */
  static onWarn(info: string): void {
    logger.warn(info);
  }
}

export default ClientDefaultHandlers;
