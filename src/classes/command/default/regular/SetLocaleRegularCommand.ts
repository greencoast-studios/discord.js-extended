import Discord from 'discord.js';
import RegularCommand from '../../RegularCommand';
import ExtendedClient from '../../../ExtendedClient';

/**
 * The default set locale regular command. This command is part of the `config` group.
 *
 * This command updates the locale for the current guild.
 * @category config - Configuration Commands
 */
class SetLocaleRegularCommand extends RegularCommand {
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
      userPermissions: [Discord.Permissions.FLAGS.MANAGE_GUILD]
    });
  }

  /**
   * Run the set locale command. Usage:
   * ```text
   * /set_locale <locale>
   * ```
   * @param message The [message](https://discord.js.org/#/docs/discord.js/stable/class/Message) that triggered this command.
   * @param args The arguments passed to this command.
   */
  public async run(message: Discord.Message, args: string[]): Promise<Discord.Message> {
    const localizer = this.client.localizer!.getLocalizer(message.guild!)!; // We know it comes from a guild because of guildOnly.
    const [newLocale] = args;

    if (!newLocale) {
      return message.reply('You need to specify a locale.');
    }

    if (newLocale === localizer.locale) {
      return message.reply(`Locale is already set to ${localizer.locale}.`);
    }

    await localizer.updateLocale(newLocale); // Failure caught by onError.
    return message.reply(`Successfully updated locale to ${newLocale}.`);
  }
}

export default SetLocaleRegularCommand;
