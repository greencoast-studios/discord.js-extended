import Discord from 'discord.js';
import logger from '@greencoast/logger';

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
   * @param guild The created guild.
   */
  static onGuildCreate(guild: Discord.Guild): void {
    logger.info(`Joined guild ${guild.name}`);
  }

  /**
   * Log the guild that the client has left.
   * @param guild The deleted guild.
   */
  static onGuildDelete(guild: Discord.Guild): void {
    logger.info(`Left guild ${guild.name}`);
  }

  /**
   * Log the guild that is currently unavailable.
   * @param guild The unavailable guild.
   */
  static onGuildUnavailable(guild: Discord.Guild): void {
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
   * Log the client's rate limiting messages.
   * @param info The client's rate limiting info.
   */
  static onRateLimit(info: Discord.RateLimitData): void {
    logger.warn('You are being rate limited!');
    logger.warn(`${info.method}: ${info.path} (${info.timeout}ms) [MAX: ${info.limit}]`);
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
