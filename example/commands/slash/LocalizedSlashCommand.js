const { SlashCommand } = require('@greencoast/discord.js-extended');
const { SlashCommandBuilder } = require('@discordjs/builders');

class LocalizedSlashCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: 'localized',
      description: 'Test localization.',
      group: 'slash',
      dataBuilder: new SlashCommandBuilder()
    });
  }

  run(interaction) {
    const localizer = this.client.localizer.getLocalizer(interaction.guild);

    return interaction.reply(localizer.t('extra.only_english', { name: interaction.user.username }));
  }
}

module.exports = LocalizedSlashCommand;
