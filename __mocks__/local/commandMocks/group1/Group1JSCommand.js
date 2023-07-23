const { RegularCommand } = require('../../../../dist');

class Group1JSCommand extends RegularCommand {
  constructor(client, info = {}) {
    super(client, {
      name: 'Group1JSCommand',
      description: 'description',
      group: 'group1',
      ...info
    });
  }

  run() {
    return Promise.resolve();
  }
}

module.exports = Group1JSCommand;
