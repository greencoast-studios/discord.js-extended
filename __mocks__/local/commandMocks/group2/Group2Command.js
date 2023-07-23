const { RegularCommand } = require('../../../../dist');

class Group2Command extends RegularCommand {
  constructor(client, info = {}) {
    super(client, {
      name: 'Group2Command',
      description: 'description',
      group: 'group2',
      ...info
    });
  }

  run() {
    return Promise.resolve();
  }
}

module.exports = Group2Command;
