import Discord from 'discord.js';
import Command from './Command';

class CommandGroup {
  public readonly id: string;
  public name: string;
  public commands: Discord.Collection<string, Command>;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
    this.commands = new Discord.Collection();
  }

  public registerCommand(command: Command): void {
    if (command.groupID !== this.id) {
      throw new Error(`Cannot register ${command.name} inside group ${this.name}, IDs do not match.`);
    }

    this.commands.set(command.name, command);
    command.group = this;
  }
}

export default CommandGroup;
