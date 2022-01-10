import Discord from 'discord.js';
import RegularCommand from '../../RegularCommand';
import ExtendedClient from '../../../ExtendedClient';

/**
 * The default help message. This regular command is part of the `misc` group.
 *
 * The help message will look like this: ![Preview](https://i.imgur.com/y0ffAjN.png)
 * @category misc - Miscellaneous Commands
 */
class HelpRegularCommand extends RegularCommand {
  /**
   * The color of the embed for the help message.
   * @type {Discord.ColorResolvable}
   * @memberof HelpRegularCommand
   */
  public embedColor: Discord.ColorResolvable;

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
      ownerOnly: false
    });

    this.embedColor = '#43aa8b';
    this.embedThumbnail = 'https://i.imgur.com/Tqnk48j.png';
  }

  /**
   * Prepare the fields that will be added to the embed based on all the commands registered on the client.
   * The title of the field will be the group's name and the text will be the list of commands.
   * @returns An array of objects that contain the field's title and text.
   */
  public prepareFields(): { title: string, text: string }[] {
    return this.client.registry.groups.map((group) => {
      const listOfCommands = group.commands.reduce((text, command) => {
        return text.concat(`${command.emoji} **${this.client.prefix}${command.name}** - ${command.description}\n`);
      }, '');

      return { title: group.name, text: listOfCommands };
    });
  }

  /**
   * Run the help command. Usage:
   * ```text
   * $help
   * ```
   * @param message The [message](https://discord.js.org/#/docs/discord.js/stable/class/Message) that triggered this command.
   * @returns The [message](https://discord.js.org/#/docs/discord.js/stable/class/Message) where the help message embed was sent.
   */
  public run(message: Discord.Message): Promise<Discord.Message> {
    const embed = new Discord.MessageEmbed();
    const fields = this.prepareFields();

    embed.setTitle('Command List and Help');
    embed.setColor(this.embedColor);
    embed.setThumbnail(this.embedThumbnail);

    for (const key in fields) {
      const field = fields[key];
      embed.addField(field.title, field.text);
    }

    return message.channel.send({ embeds: [embed] });
  }
}

export default HelpRegularCommand;
