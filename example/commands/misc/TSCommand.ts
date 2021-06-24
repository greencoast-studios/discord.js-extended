const { Command } = require('@greencoast/discord.js-extended');

class TSCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'TSPing',
      description: 'Ping',
      group: 'misc'
    });
  }

  run(message) {
    return message.reply('Pong!');
  }
}

module.exports = TSCommand;
