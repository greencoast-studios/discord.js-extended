const { Command } = require('@greencoast/discord.js-extended');

class UnknownCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'Unknown',
      description: 'Unknown',
      group: 'misc'
    });
  }

  run(message) {
    return message.reply('Pong!');
  }
}

module.exports = UnknownCommand;
