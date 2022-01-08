const { SlashCommand } = require('@greencoast/discord.js-extended');
const { SlashCommandBuilder } = require('@discordjs/builders');

class PingSlashCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: 'ping_slash',
      description: 'Ping-Pong',
      group: 'slash',
      dataBuilder: new SlashCommandBuilder()
    });
  }

  run(interaction) {
    return interaction.reply('Pong!');
  }
}

module.exports = PingSlashCommand;
