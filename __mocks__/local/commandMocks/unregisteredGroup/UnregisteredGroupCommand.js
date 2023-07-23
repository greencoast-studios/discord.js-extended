const { RegularCommand } = require('../../../../dist');

class UnregisteredGroupCommand extends RegularCommand {
  constructor(client, info = {}) {
    super(client, {
      name: 'UnregisteredGroupCommand',
      description: 'description',
      group: 'unregisteredGroup',
      ...info
    });
  }

  run() {
    return Promise.resolve();
  }
}

module.exports = UnregisteredGroupCommand;
