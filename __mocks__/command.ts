/* eslint-disable @typescript-eslint/no-explicit-any */
import Discord from 'discord.js';
import ExtendedClient from '../src/classes/ExtendedClient';
import Command from '../src/classes/command/Command';

jest.mock('discord.js');

class ConcreteCommand extends Command {
  constructor(client: ExtendedClient, info: Record<string, any> = {}) {
    super(client, {
      name: 'Command',
      description: 'description',
      group: 'group',
      ...info
    });
  }

  run(message: Discord.Message): Promise<Discord.Message> {
    return Promise.resolve(message);
  }
}

export default ConcreteCommand;
