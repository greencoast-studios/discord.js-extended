import Discord from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import SlashCommand from '../../SlashCommand';
import ExtendedClient from '../../../ExtendedClient';

/**
 * The default set locale command. This command is part of the `config` group.
 *
 * This command updates the locale for the current guild.
 * @category config - Configuration Commands
 */
class SetLocaleSlashCommand extends SlashCommand {
  /**
   * @param client The client that this command will be used by.
   */
  constructor(client: ExtendedClient) {
    super(client, {
      name: 'set_locale',
      emoji: ':earth_americas:',
      group: 'config',
      description: 'Update the locale for this guild.',
      guildOnly: true,
      userPermissions: [Discord.Permissions.FLAGS.MANAGE_GUILD],
      dataBuilder: new SlashCommandBuilder().addStringOption((input) => {
        return input
          .setName('locale')
          .setDescription('The new locale to be used.')
          .setRequired(true);
      }) as SlashCommandBuilder
    });
  }

  /**
   * Run the set locale command. Usage:
   * ```text
   * /set_locale <locale>
   * ```
   * @param interaction The [interaction](https://discord.js.org/#/docs/discord.js/stable/class/CommandInteraction) that triggered this command.
   */
  public async run(interaction: Discord.CommandInteraction): Promise<void> {
    const localizer = this.client.localizer!.getLocalizer(interaction.guild!)!; // We know it comes from a guild because of guildOnly.
    const newLocale = interaction.options.getString('locale')!; // We know it's not null because it is required.

    if (newLocale === localizer.locale) {
      await interaction.reply(`Locale is already set to ${localizer.locale}.`);
      return;
    }

    await localizer.updateLocale(newLocale); // Failure caught by onError.
    await interaction.reply(`Successfully updated locale to ${newLocale}.`);
  }
}

export default SetLocaleSlashCommand;
