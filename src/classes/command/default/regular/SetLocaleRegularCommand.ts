import { PermissionsBitField, Message } from 'discord.js';
import { RegularCommand } from '../../RegularCommand';
import { ExtendedClient } from '../../../ExtendedClient';

/**
 * The default set locale command. This regular command is part of the `config` group.
 *
 * This command updates the locale for the current guild.
 * @category config - Configuration Commands
 */
export class SetLocaleRegularCommand extends RegularCommand {
  /**
   * @param client The client that this command will be used by.
   */
  public constructor(client: ExtendedClient) {
    super(client, {
      name: 'set_locale',
      emoji: ':earth_americas:',
      group: 'config',
      description: 'Update the locale for this guild.',
      guildOnly: true,
      userPermissions: [PermissionsBitField.Flags.ManageGuild]
    });
  }

  /**
   * Run the set locale command. Usage:
   * ```text
   * /set_locale <locale>
   * ```
   * @param message The [message](https://old.discordjs.dev/#/docs/discord.js/main/class/Message) that triggered this command.
   * @param args The arguments passed to this command.
   */
  public async run(message: Message, args: string[]): Promise<void> {
    const localizer = this.client.localizer!.getLocalizer(message.guild!)!; // We know it comes from a guild because of guildOnly.
    const [newLocale] = args;

    if (!newLocale) {
      await message.reply('You need to specify a locale.');
      return;
    }

    if (newLocale === localizer.locale) {
      await message.reply(`Locale is already set to ${localizer.locale}.`);
      return;
    }

    await localizer.updateLocale(newLocale); // Failure caught by onError.
    await message.reply(`Successfully updated locale to ${newLocale}.`);
  }
}
