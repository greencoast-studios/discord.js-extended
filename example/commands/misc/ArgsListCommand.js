const { RegularCommand } = require('@greencoast/discord.js-extended');

class ArgsListCommand extends RegularCommand {
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

module.exports = ArgsListCommand;
