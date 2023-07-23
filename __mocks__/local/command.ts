import { Message, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { ExtendedClient, RegularCommand, SlashCommand } from '../../src';

export class ConcreteRegularCommand extends RegularCommand {
  constructor(client: ExtendedClient, info: Record<string, any> = {}) {
    super(client, {
      name: 'RegularCommand',
      description: 'description',
      group: 'group',
      ...info
    });
  }

  override run(message: Message): Promise<Message> {
    return Promise.resolve(message);
  }
}

export class ConcreteSlashCommand extends SlashCommand {
  constructor(client: ExtendedClient, info: Record<string, any> = {}) {
    super(client, {
      name: 'slash_command',
      description: 'description',
      group: 'group',
      dataBuilder: new SlashCommandBuilder(),
      ...info
    });
  }

  override async run(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply('hi');
  }
}
