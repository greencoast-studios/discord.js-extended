const { Command } = require('@greencoast/discord.js-extended');

class HelpCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'Help',
      description: 'Help',
      group: 'misc'
    });
  }

  run(message) {
    return message.reply('Pong!');
  }
}

module.exports = HelpCommand;
