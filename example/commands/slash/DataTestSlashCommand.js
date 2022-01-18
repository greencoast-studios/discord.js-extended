const { SlashCommand } = require('@greencoast/discord.js-extended');
const { SlashCommandBuilder } = require('@discordjs/builders');

class DataTestSlashCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: 'data_test',
      description: 'Test the data in the data provider.',
      group: 'slash',
      dataBuilder: new SlashCommandBuilder()
        .addSubcommand((input) => {
          return input
            .setName('get')
            .setDescription('Get a value.')
            .addStringOption((input) => {
              return input
                .setName('key')
                .setDescription('The key to query.')
                .setRequired(true);
            });
        })
        .addSubcommand((input) => {
          return input
            .setName('set')
            .setDescription('Set a value.')
            .addStringOption((input) => {
              return input
                .setName('key')
                .setDescription('The key to set.')
                .setRequired(true);
            })
            .addStringOption((input) => {
              return input
                .setName('value')
                .setDescription('The value to set.')
                .setRequired(true);
            });
        })
        .addSubcommand((input) => {
          return input
            .setName('delete')
            .setDescription('Delete a value.')
            .addStringOption((input) => {
              return input
                .setName('key')
                .setDescription('The key to delete.')
                .setRequired(true);
            });
        })
        .addSubcommand((input) => {
          return input
            .setName('clear')
            .setDescription('Clear the data.');
        })
        .addSubcommand((input) => {
          return input
            .setName('get_global')
            .setDescription('Get a value globally.')
            .addStringOption((input) => {
              return input
                .setName('key')
                .setDescription('The key to query.')
                .setRequired(true);
            });
        })
        .addSubcommand((input) => {
          return input
            .setName('set_global')
            .setDescription('Set a value globally.')
            .addStringOption((input) => {
              return input
                .setName('key')
                .setDescription('The key to set.')
                .setRequired(true);
            })
            .addStringOption((input) => {
              return input
                .setName('value')
                .setDescription('The value to set.')
                .setRequired(true);
            });
        })
        .addSubcommand((input) => {
          return input
            .setName('delete_global')
            .setDescription('Delete a value globally.')
            .addStringOption((input) => {
              return input
                .setName('key')
                .setDescription('The key to delete.')
                .setRequired(true);
            });
        })
        .addSubcommand((input) => {
          return input
            .setName('clear_global')
            .setDescription('Clear the data globally.');
        })
    });
  }

  async run(interaction) {
    const subCommand = interaction.options.getSubcommand();
    const key = interaction.options.getString('key');
    const value = interaction.options.getString('value');

    switch(subCommand) {
      case 'get':
        return interaction.reply(`Here's the data: \`${await this.client.dataProvider.get(interaction.guild, key)}\``);
      case 'get_global':
        return interaction.reply(`Here's the data: \`${await this.client.dataProvider.getGlobal(key)}\``);
      case 'set':
        await this.client.dataProvider.set(interaction.guild, key, value);
        return interaction.reply(`Set data for \`${key}\` to \`${value}\`.`);
      case 'set_global':
        await this.client.dataProvider.setGlobal(key, value);
        return interaction.reply(`Set data for \`${key}\` to \`${value}\`.`);
      case 'delete':
        await this.client.dataProvider.delete(interaction.guild, key);
        return interaction.reply(`Removed data for \`${key}\`.`);
      case 'delete_global':
        await this.client.dataProvider.deleteGlobal(key);
        return interaction.reply(`Removed data for \`${key}\`.`);
      case 'clear':
        await this.client.dataProvider.clear(interaction.guild);
        return interaction.reply('Cleared data for this guild.');
      case 'clear_global':
        await this.client.dataProvider.clearGlobal();
        return interaction.reply('Cleared data globally.');
    }
  }
}

module.exports = DataTestSlashCommand;
