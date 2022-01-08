/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
const { RegularCommand } = require('../../../dist');

class UnregisteredGroupCommand extends RegularCommand {
  constructor(client, info = {}) {
    super(client, {
      name: 'UnregisteredGroupCommand',
      description: 'description',
      group: 'unregisteredGroup',
      ...info
    });
  }

  run(message) {
    return Promise.resolve(message);
  }
}

module.exports = UnregisteredGroupCommand;
