const { RegularCommand } = require('@greencoast/discord.js-extended');

class PingCommand extends RegularCommand {
  constructor(client) {
    super(client, {
      name: 'ping',
      description: 'Ping-Pong',
      group: 'util'
    });
  }

  run(message) {
    return message.reply('Pong!');
  }
}

module.exports = PingCommand;
