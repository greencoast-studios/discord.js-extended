import Discord from 'discord.js';
import Command from './Command';

/**
 * A command group, contains all the commands related to a group.
 */
class CommandGroup {
  public readonly id: string;
  public name: string;
  public commands: Discord.Collection<string, Command>;

  /**
   * @param id The ID of this group.
   * @param name The name of this group.
   */
  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
    this.commands = new Discord.Collection();
  }

  /**
   * Register a command inside this group.
   * @param command The command to register in this group.
   */
  public registerCommand(command: Command): void {
    if (command.groupID !== this.id) {
      throw new Error(`Cannot register ${command.name} inside group ${this.name}, IDs do not match.`);
    }

    this.commands.set(command.name, command);
    command.group = this;
  }
}

export default CommandGroup;
