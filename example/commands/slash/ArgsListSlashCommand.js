const { SlashCommand } = require('@greencoast/discord.js-extended');
const { SlashCommandBuilder } = require('@discordjs/builders');

class ArgsListSlashCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: 'args_slash',
      description: 'Get list of args.',
      group: 'slash',
      dataBuilder: new SlashCommandBuilder()
        .addStringOption((input) => input.setName('args').setDescription('Arguments...'))
    });
  }

  run(interaction) {
    interaction.reply(interaction.options.getString('args'));
  }
}

module.exports = ArgsListSlashCommand;
