import Discord from 'discord.js';
import logger from '@greencoast/logger';
import Command from '../command/Command';

class ExtraClientDefaultHandlers {
  static onCommandExecute(command: Command, message: Discord.Message): void {
    logger.info(`User ${message.member?.displayName || message.author.username} issued command ${command.name} in ${message.guild?.name || 'DM'}`);
  }

  static onCommandError(error: Error, command: Command, message: Discord.Message): void {
    logger.error(`Something happened when executing ${command.name} in ${message.guild?.name || 'DM'}.`);
    logger.error(`Triggering message: ${message.content}`);
    logger.error(error);
  }
}

export default ExtraClientDefaultHandlers;
