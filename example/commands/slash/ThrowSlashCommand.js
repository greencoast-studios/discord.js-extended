const { SlashCommand } = require('@greencoast/discord.js-extended');
const { SlashCommandBuilder } = require('@discordjs/builders');

class ThrowSlashCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: 'throw_slash',
      aliases: ['t'],
      description: 'Throws an error.',
      group: 'slash',
      dataBuilder: new SlashCommandBuilder()
    });
  }

  run(interaction) {
    throw new Error('Oops!');
  }
}

module.exports = ThrowSlashCommand;
