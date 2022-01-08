const { RegularCommand } = require('@greencoast/discord.js-extended');

class ThrowCommand extends RegularCommand {
  constructor(client) {
    super(client, {
      name: 'throw',
      description: 'Throws an error.',
      group: 'util'
    });
  }

  run(message) {
    throw new Error('Oops!');
  }
}

module.exports = ThrowCommand;
