/* eslint-disable @typescript-eslint/no-explicit-any */
import Discord from 'discord.js';
import ExtendedClient from '../../../src/classes/ExtendedClient';
import RegularCommand from '../../../src/classes/command/RegularCommand';

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

  run(message: Discord.Message): Promise<Discord.Message> {
    return Promise.resolve(message);
  }
}

module.exports = Group1TSCommand;
