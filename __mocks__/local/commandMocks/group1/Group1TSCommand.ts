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

  run(): Promise<void> {
    return Promise.resolve();
  }
}

module.exports = Group1TSCommand;
