/* eslint-disable @typescript-eslint/no-explicit-any */
import Discord from 'discord.js';
import ExtendedClient from '../../../src/classes/ExtendedClient';
import Command from '../../../src/classes/command/Command';

jest.mock('discord.js');

class Group1TSCommand extends Command {
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
