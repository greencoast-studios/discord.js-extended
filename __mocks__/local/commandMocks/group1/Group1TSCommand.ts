import { Message } from 'discord.js';
import { ExtendedClient, RegularCommand } from '../../../../src';

jest.mock('discord.js');

class Group1TSCommand extends RegularCommand {
  constructor(client: ExtendedClient, info: Record<string, any> = {}) {
    super(client, {
      name: 'Group1TSCommand',
      description: 'description',
      group: 'group1',
      ...info
    });
  }

  run(message: Message): Promise<Message> {
    return Promise.resolve(message);
  }
}

module.exports = Group1TSCommand;
