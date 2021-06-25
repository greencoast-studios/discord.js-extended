import Discord from 'discord.js';
import Command from '../Command';
import ExtendedClient from '../../ExtendedClient';

class HelpCommand extends Command {
  public embedColor: string;
  public embedThumbnail: string;

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

  public prepareFields(): { title: string, text: string }[] {
    return this.client.registry.groups.map((group) => {
      const listOfCommands = group.commands.reduce((text, command) => {
        return text.concat(`${command.emoji} **${this.client.prefix}${command.name}** - ${command.description}\n`);
      }, '');

      return { title: group.name, text: listOfCommands };
    });
  }

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

    return message.channel.send(embed);
  }
}

export default HelpCommand;
