import { Message, TextChannel, Interaction } from 'discord.js';
import { ExtendedClient } from '../ExtendedClient';
import { CommandRegistry } from './CommandRegistry';
import { RegularCommand } from './RegularCommand';
import { SlashCommand } from './SlashCommand';

/**
 * A command dispatcher. This handles command fetching and execution.
 */
export class CommandDispatcher {
  /**
   * The client that this command dispatcher will be used by.
   * @type {ExtendedClient}
   * @memberof CommandDispatcher
   */
  public readonly client: ExtendedClient;

  /**
   * The command registry used by this command dispatcher.
   * @type {CommandRegistry}
   * @memberof CommandDispatcher
   */
  public readonly registry: CommandRegistry;

  /**
   * @param client The client that this command dispatcher will be used by.
   * @param registry he command registry used by this command dispatcher.
   */
  public constructor(client: ExtendedClient, registry: CommandRegistry) {
    this.client = client;
    this.registry = registry;
  }

  /**
   * Handles command fetching and execution for message based commands (RegularCommand).
   * @param message The [message](https://old.discordjs.dev/#/docs/discord.js/main/class/Message) that triggered this handler.
   * @emits `client#commandExecute`
   */
  public async handleMessage(message: Message): Promise<void> {
    if (message.partial || message.author.bot || !message.content.startsWith(this.client.prefix)) {
      return;
    }

    const args = message.content.slice(this.client.prefix.length).trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();

    const command = this.registry.resolveCommand(commandName!);

    if (!command || !(command instanceof RegularCommand) || command.guildOnly && !message.guild) {
      return;
    }

    if (command.nsfw && (message.channel instanceof TextChannel && !message.channel.nsfw)) {
      await message.reply('This command may only be used in a NSFW channel.');
      return;
    }

    try {
      const hasPermission = command.hasPermission(message);

      if (typeof hasPermission === 'string') {
        await message.reply(hasPermission);
        return;
      }

      this.client.emit('commandExecute', command, message);
      await command.run(message, args);
    } catch (error) {
      await command.onError(error, message);
    }
  }

  /**
   * Handles command fetching and execution for slash commands.
   * @param interaction The [interaction](https://old.discordjs.dev/#/docs/discord.js/main/class/ChatInputCommandInteraction) that triggered this handler.
   * @emits `client#commandExecute`
   */
  public async handleInteraction(interaction: Interaction): Promise<void> {
    if (!interaction.isChatInputCommand()) {
      return;
    }

    const command = this.registry.resolveCommand(interaction.commandName);

    if (!command || !(command instanceof SlashCommand) || command.guildOnly && !interaction.inGuild()) {
      return;
    }

    if (command.nsfw && (interaction.channel instanceof TextChannel && !interaction.channel.nsfw)) {
      await interaction.reply('This command may only be used in a NSFW channel.');
      return;
    }

    try {
      const hasPermission = command.hasPermission(interaction);

      if (typeof hasPermission === 'string') {
        await interaction.reply(hasPermission);
        return;
      }

      this.client.emit('commandExecute', command, interaction);
      await command.run(interaction);
    } catch (error) {
      await command.onError(error, interaction);
    }
  }
}
