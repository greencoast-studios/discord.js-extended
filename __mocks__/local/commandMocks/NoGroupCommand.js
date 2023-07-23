const { RegularCommand } = require('../../../dist');

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
