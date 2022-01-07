/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
const { RegularCommand } = require('../../../dist');

class Group2Command extends RegularCommand {
  constructor(client, info = {}) {
    super(client, {
      name: 'Group2Command',
      description: 'description',
      group: 'group2',
      ...info
    });
  }

  run(message) {
    return Promise.resolve(message);
  }
}

module.exports = Group2Command;
