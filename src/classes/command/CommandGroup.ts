import Discord from 'discord.js';
import Command from './Command';
import { CommandTrigger } from '../../types';

/**
 * A command group, contains all the commands related to a group.
 */
class CommandGroup {
  /**
   * The ID of this group.
   * @type {string}
   * @memberof CommandGroup
   */
  public readonly id: string;

  /**
   * The name of this group.
   * @type {string}
   * @memberof CommandGroup
   */
  public name: string;

  /**
   * A [collection](https://discord.js.org/#/docs/collection/master/class/Collection) of the commands
   * registered to this group, mapped by the command's name and the command.
   * @type {Discord.Collection<string, Command>}
   * @memberof CommandGroup
   */
  public commands: Discord.Collection<string, Command<CommandTrigger>>;

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
   * @returns This command group.
   * @throws Throws if the `groupID` of the command does not match the ID of this group.
   */
  public registerCommand(command: Command<CommandTrigger>): this {
    if (command.groupID !== this.id) {
      throw new Error(`Cannot register ${command.name} inside group ${this.name}, IDs do not match.`);
    }

    this.commands.set(command.name, command);
    command.group = this;

    return this;
  }
}

export default CommandGroup;
