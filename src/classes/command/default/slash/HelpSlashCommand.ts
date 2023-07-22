import { ColorResolvable, SlashCommandBuilder, EmbedField, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { SlashCommand } from '../../SlashCommand';
import { ExtendedClient } from '../../../ExtendedClient';

/**
 * The default help message. This slash command is part of the `misc` group.
 *
 * The help message will look like this: ![Preview](https://i.imgur.com/y0ffAjN.png)
 * @category misc - Miscellaneous Commands
 */
export class HelpSlashCommand extends SlashCommand {
  /**
   * The color of the embed for the help message.
   * @type {ColorResolvable}
   * @memberof HelpRegularCommand
   */
  public embedColor: ColorResolvable;

  /**
   * The thumbnail of the embed for the help message.
   * @type {string}
   * @memberof HelpRegularCommand
   */
  public embedThumbnail: string;

  /**
   * @param client The client that this command will be used by.
   */
  constructor(client: ExtendedClient) {
    super(client, {
      name: 'help',
      emoji: ':question:',
      group: 'misc',
      description: 'Get a description of all the commands that this bot can run.',
      guildOnly: false,
      ownerOnly: false,
      dataBuilder: new SlashCommandBuilder()
    });

    this.embedColor = '#43aa8b';
    this.embedThumbnail = 'https://i.imgur.com/Tqnk48j.png';
  }

  /**
   * Prepare the fields that will be added to the embed based on all the commands registered on the client.
   * The title of the field will be the group's name and the text will be the list of commands.
   * @returns An array of objects that contain the field's title and text.
   */
  public prepareFields(): EmbedField[] {
    return this.client.registry.groups.map((group) => {
      const listOfCommands = group.commands.reduce((text, command) => {
        return text.concat(`${command.emoji} **/${command.name}** - ${command.description}\n`);
      }, '');

      return { name: group.name, value: listOfCommands, inline: false };
    });
  }

  /**
   * Run the help command. Usage:
   * ```text
   * $help
   * ```
   * @param interaction The [interaction](https://discord.js.org/#/docs/discord.js/stable/class/CommandInteraction) that triggered this command.
   */
  public async run(interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = new EmbedBuilder();

    embed.setTitle('Command List and Help');
    embed.setColor(this.embedColor);
    embed.setThumbnail(this.embedThumbnail);

    embed.addFields(this.prepareFields());

    await interaction.reply({ embeds: [embed] });
  }
}
