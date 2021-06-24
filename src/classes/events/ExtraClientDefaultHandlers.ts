import Discord from 'discord.js';
import logger from '@greencoast/logger';
import Command from '../command/Command';
import CommandGroup from '../command/CommandGroup';

class ExtraClientDefaultHandlers {
  static onDataProviderAdd(): void {
    logger.info('Added data provider to client.');
  }

  static onCommandExecute(command: Command, message: Discord.Message): void {
    logger.info(`User ${message.member?.displayName || message.author.username} issued command ${command.name} in ${message.guild?.name || 'DM'}`);
  }

  static onCommandError(error: Error, command: Command, message: Discord.Message): void {
    logger.error(`Something happened when executing ${command.name} in ${message.guild?.name || 'DM'}.`);
    logger.error(`Triggering message: ${message.content}`);
    logger.error(error);
  }

  static onGroupRegistered(group: CommandGroup): void {
    logger.info(`Registered ${group.name} (id: ${group.id}) command group.`);
  }

  static onCommandRegistered(command: Command): void {
    logger.info(`Registered ${command.name} in ${command.group?.name}.`);
  }
}

export default ExtraClientDefaultHandlers;
