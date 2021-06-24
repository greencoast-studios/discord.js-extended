const { Command } = require('@greencoast/discord.js-extended');

class HelpCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'args',
      description: 'Get list of args.',
      group: 'misc'
    });
  }

  run(message, args) {
    return message.reply(args.join('\n- '));
  }
}

module.exports = HelpCommand;
