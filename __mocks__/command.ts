import { Message, ChatInputCommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import ExtendedClient from '../src/classes/ExtendedClient';
import RegularCommand from '../src/classes/command/RegularCommand';
import SlashCommand from '../src/classes/command/SlashCommand';

jest.mock('discord.js');

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
