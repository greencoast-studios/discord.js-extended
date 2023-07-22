import { Collection } from 'discord.js';
import requireAll from 'require-all';
import Command from './Command';
import CommandGroup from './CommandGroup';
import SlashCommand from './SlashCommand';
import ExtendedClient from '../ExtendedClient';
import * as DefaultCommands from './default';
import { CommandTrigger } from '../../types';

/**
 * A command registry. This keeps track of all the commands and command groups registered in the client.
 */
class CommandRegistry {
  /**
   * The client that this command registry will be used by.
   * @type {ExtendedClient}
   * @memberof CommandRegistry
   */
  public readonly client: ExtendedClient;

  /**
   * A [collection](https://discord.js.org/#/docs/collection/master/class/Collection) of the commands registered
   * to this registry, mapped by the command's name and the command.
   * @type {Collection<string, Command>}
   * @memberof CommandRegistry
   */
  public commands: Collection<string, Command<CommandTrigger>>;

  /**
   * A [collection](https://discord.js.org/#/docs/collection/master/class/Collection) of the groups registered
   * to this registry, mapped by the group's ID and the group.
   * @type {Collection<string, CommandGroup>}
   * @memberof CommandRegistry
   */
  public groups: Collection<string, CommandGroup>;

  /**
   * @param client The client that this command registry will be used by.
   */
  constructor(client: ExtendedClient) {
    this.client = client;
    this.commands = new Collection();
    this.groups = new Collection();
  }

  /**
   * Resolves the command from this registry corresponding to its name or alias.
   * @param name The name or alias of the command.
   * @returns The resolved command, or `undefined` if no command is resolved.
   */
  public resolveCommand(name: string): Command<CommandTrigger> | undefined {
    return this.commands.get(name) || this.commands.find((command) => command.aliases.includes(name));
  }

  /**
   * Returns an array with all the slash commands registered.
   * @returns The array of slash commands.
   */
  public getSlashCommands(): SlashCommand[] {
    return this.commands
      .filter((command) => command instanceof SlashCommand)
      .map((command) => command as SlashCommand);
  }

  /**
   * Register a command group.
   * @param id The ID of the group.
   * @param name The name of the group.
   * @returns This command registry.
   * @throws Throws if the `groupID` is already registered.
   * @emits `client#groupRegistered`
   */
  public registerGroup(id: string, name: string): this {
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
   * @param groups An array of arrays of strings. The inner arrays must have the shape: `[groupID, groupName]`.
   * @returns This command registry.
   * @throws Throws if any `groupID` is already registered.
   * @emits `client#groupRegistered`
   */
  public registerGroups(groups: [string, string][]): this {
    for (const group of groups) {
      this.registerGroup(...group);
    }

    return this;
  }

  /**
   * Register a command to this registry.
   * @param command The command to register.
   * @returns This command registry.
   * @throws Throws if the command's `groupID` is not registered.
   * @throws Throws if the command's `name` is already registered.
   * @throws Throws if the command's `name` is also specified as its own `alias`.
   * @throws Throws if any of the command's `aliases` is already registered.
   * @emits `client#commandRegistered`
   */
  public registerCommand(command: Command<CommandTrigger>): this {
    const group = this.groups.get(command.groupID);

    if (!group) {
      throw new Error(`Group ${command.groupID} is not registered.`);
    }

    if (this.resolveCommand(command.name)) {
      throw new Error(`Command ${command.name} is already registered.`);
    }

    for (const alias of command.aliases) {
      if (this.resolveCommand(alias)) {
        throw new Error(`Command ${alias} is already registered.`);
      }

      if (alias === command.name) {
        throw new Error(`Command ${command.name} contains its own name as an alias. Please remove ${command.name} from its aliases.`);
      }
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
   * @throws Throws if any of the command's `groupID` is not registered.
   * @throws Throws if any of the command's `name` is already registered.
   * @throws Throws if any of the command's `name` is also specified as its own `alias`.
   * @throws Throws if any of the command's `aliases` is already registered.
   * @emits `client#commandRegistered`
   */
  public registerCommands(commands: Command<CommandTrigger>[]): this {
    for (const command of commands) {
      this.registerCommand(command);
    }

    return this;
  }

  /**
   * Register all commands in a directory. Commands must be located inside subdirectories with the `groupID` as name.
   * Groups must be registered beforehand, otherwise this method will not pick them up.
   * @param path The resolved path to the directory containing all commands.
   * @throws Throws if any of the command's `groupID` is not registered.
   * This may happen if a command with an unregistered group is located inside a registered group subdirectory.
   * @throws Throws if any of the command's `name` is already registered.
   * @throws Throws if any the command's `name` is also specified as its own `alias`.
   * @throws Throws if any of the command's `aliases` is already registered.
   * @emits `client#commandRegistered`
   * @returns This command registry.
   */
  public registerCommandsIn(path: string): this {
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

  /**
   * Register the default groups. The default groups are:
   *
   * | ID of the group | Name of the group        |
   * |-----------------|--------------------------|
   * | `misc`          | `Miscellaneous Commands` |
   * | `config`        | `Configuration Commands` |
   * @returns This command registry.
   * @emits `client#groupRegistered`
   */
  public registerDefaultGroups(): this {
    this.registerGroups([
      ['misc', 'Miscellaneous Commands'],
      ['config', 'Configuration Commands']
    ]);

    return this;
  }

  /**
   * Register the default commands. **Default groups should be registered before using this.**
   * For more information, check out {@link DefaultCommands}.
   * @param registerSlash If true it will register the default slash commands otherwise, the regular ones
   * will be registered.
   * @returns This command registry.
   * @emits `client#commandRegistered`
   */
  public registerDefaultCommands(registerSlash = true): this {
    const defaults = registerSlash ? DefaultCommands.Slash : DefaultCommands.Regular;
    this.registerCommands(Object.values(defaults).map((Command) => new Command(this.client)));

    return this;
  }

  /**
   * Register both the default groups and default slash commands in the correct order.
   * @returns This command registry.
   * @emits `client#groupRegistered`
   * @emits `client#commandRegistered`
   */
  public registerDefaults(): this {
    this.registerDefaultGroups();
    this.registerDefaultCommands();

    return this;
  }
}

export default CommandRegistry;
