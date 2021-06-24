import Discord from 'discord.js';
import ExtendedClient from '../ExtendedClient';
import CommandRegistry from './CommandRegistry';

/**
 * A command dispatcher. This handles command fetching and execution.
 */
class CommandDispatcher {
  public readonly client: ExtendedClient;
  public readonly registry: CommandRegistry;

  /**
   * @param client This dispatcher's client.
   * @param registry This dispatcher's command registry.
   */
  constructor(client: ExtendedClient, registry: CommandRegistry) {
    this.client = client;
    this.registry = registry;
  }
  
  /**
   * Handles command fetching and execution.
   * @param message The message that triggered this handler.
   * @returns A promise that resolves to the result of the command's run method. If an error occurs, the promise resolves to the error message reply. Otherwise, the promise resolves to nothing.
   */
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
      
      this.client.emit('commandExecute', command, message);
      return await command.run(message, args);
    } catch (error) {
      return await command.onError(error, message);
    }
  }
}

export default CommandDispatcher;
