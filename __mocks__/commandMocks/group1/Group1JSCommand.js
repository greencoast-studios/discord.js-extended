/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
const { Command } = require('../../../dist');

class Group1JSCommand extends Command {
  constructor(client, info = {}) {
    super(client, {
      name: 'Group1JSCommand',
      description: 'description',
      group: 'group1',
      ...info
    });
  }

  run(message) {
    return Promise.resolve(message);
  }
}

module.exports = Group1JSCommand;
