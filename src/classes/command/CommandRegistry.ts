import Discord from 'discord.js';
import requireAll from 'require-all';
import Command from './Command';
import CommandGroup from './CommandGroup';
import ExtendedClient from '../ExtendedClient';

/**
 * A command registry. This keeps track of all the commands and command groups registered in the client.
 */
class CommandRegistry {
  public readonly client: ExtendedClient;
  public commands: Discord.Collection<string, Command>
  public groups: Discord.Collection<string, CommandGroup>

  /**
   * @param client This command registry's client.
   */
  constructor(client: ExtendedClient) {
    this.client = client;
    this.commands = new Discord.Collection();
    this.groups = new Discord.Collection();
  }

  /**
   * Register a command group.
   * @param id The id of the group.
   * @param name The name of the group.
   * @returns This command registry.
   */
  public registerGroup(id: string, name: string): CommandRegistry {
    const alreadyExists = this.groups.has(id);

    if (alreadyExists) {
      throw new Error(`Group ${id} is already registered.`);
    }

    const group = new CommandGroup(id, name);
    this.groups.set(group.id, group);
    this.client.emit('groupRegistered', group);

    return this;
  }

  /**
   * Register multiple command groups.
   * @param groups An array of arrays of strings. The inner arrays must have the shape: [groupID, groupName].
   * @returns This command registry.
   */
  public registerGroups(groups: [string, string][]): CommandRegistry {
    for (const group of groups) {
      this.registerGroup(...group);
    }

    return this;
  }

  /**
   * Register a command to this registry.
   * @param command The command to register.
   * @returns This command registry.
   */
  public registerCommand(command: Command): CommandRegistry {
    const group = this.groups.get(command.groupID);

    if (!group) {
      throw new Error(`Group ${command.groupID} is not registered.`);
    }

    if (this.commands.has(command.name)) {
      throw new Error(`Command ${command.name} is already registered.`);
    }

    group.registerCommand(command);
    this.commands.set(command.name, command);
    this.client.emit('commandRegistered', command);

    return this;
  }

  /**
   * Register multiple commands to this register.
   * @param commands An array of commands to register.
   * @returns This command registry.
   */
  public registerCommands(commands: Command[]): CommandRegistry {
    for (const command of commands) {
      this.registerCommand(command);
    }

    return this;
  }

  /**
   * Register all commands in a directory. Commands must be located inside subdirectories with the groupID as name. Groups must be registered before-hand, otherwise this method will not pick them up.
   * @param path The resolved path to the directory containing all commands.
   * @returns This command registry.
   */
  public registerCommandsIn(path: string): CommandRegistry {
    const commands = requireAll({
      dirname: path,
      filter: /^([^.].*)\.(js|ts)$/i,
      recursive: true,
      resolve: (Command) => new Command(this.client)
    });

    this.groups.each((group) => {
      const groupCommands = commands[group.id];

      for (const key in groupCommands) {
        this.registerCommand(groupCommands[key]);
      }
    });

    return this;
  }
}

export default CommandRegistry;
