import Discord from 'discord.js';
import logger from '@greencoast/logger';
import ExtendedClient from '../ExtendedClient';
import CommandRegistry from './CommandRegistry';

class CommandDispatcher {
  public readonly client: ExtendedClient;
  public readonly registry: CommandRegistry;

  constructor(client: ExtendedClient, registry: CommandRegistry) {
    this.client = client;
    this.registry = registry;
  }
  
  public async handleMessage(message: Discord.Message): Promise<Discord.Message | void> {
    if (message.partial || message.author.bot || !message.content.startsWith(this.client.prefix)) {
      return;
    }

    const args = message.content.slice(this.client.prefix.length).trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();

    const command = this.registry.commands.get(commandName!);

    if (!command || command.guildOnly && !message.guild) {
      return;
    }

    try {
      const hasPermission = command.hasPermission(message);

      if (typeof hasPermission === 'string') {
        message.reply(hasPermission);
        return;
      }
      
      logger.info(`User ${message.member?.displayName || message.author.username} issued command ${command.name} in ${message.guild?.name || 'DM'}`);
      return await command.run(message, args);
    } catch (error) {
      return await command.onError(error, message);
    }
  }
}

export default CommandDispatcher;
