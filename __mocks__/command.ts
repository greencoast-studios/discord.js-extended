/* eslint-disable @typescript-eslint/no-explicit-any */
import Discord from 'discord.js';
import ExtendedClient from '../src/classes/ExtendedClient';
import RegularCommand from '../src/classes/command/RegularCommand';

jest.mock('discord.js');

class ConcreteRegularCommand extends RegularCommand {
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

export default ConcreteRegularCommand;
