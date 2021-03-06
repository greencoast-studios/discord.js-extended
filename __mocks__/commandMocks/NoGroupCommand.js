/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
const { RegularCommand } = require('../../dist');

class NoGroupCommand extends RegularCommand {
  constructor(client, info = {}) {
    super(client, {
      name: 'NoGroupCommand',
      description: 'description',
      group: 'noGroup',
      ...info
    });
  }

  run(message) {
    return Promise.resolve(message);
  }
}

module.exports = NoGroupCommand;
