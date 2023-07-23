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

  run(message) {
    return Promise.resolve(message);
  }
}

module.exports = UnregisteredGroupCommand;
