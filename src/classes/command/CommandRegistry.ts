import Discord from 'discord.js';
import requireAll from 'require-all';
import Command from './Command';
import CommandGroup from './CommandGroup';
import ExtendedClient from '../ExtendedClient';

class CommandRegistry {
  public readonly client: ExtendedClient;
  public commands: Discord.Collection<string, Command>
  public groups: Discord.Collection<string, CommandGroup>

  constructor(client: ExtendedClient) {
    this.client = client;
    this.commands = new Discord.Collection();
    this.groups = new Discord.Collection();
  }

  public registerGroup(id: string, name: string): CommandRegistry {
    const alreadyExists = this.groups.has(id);

    if (alreadyExists) {
      throw new Error(`Group ${id} is already registered.`);
    }

    const group = new CommandGroup(id, name);
    this.groups.set(group.id, group);

    return this;
  }

  public registerGroups(groups: [string, string][]): CommandRegistry {
    for (const group of groups) {
      this.registerGroup(...group);
    }

    return this;
  }

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

    return this;
  }

  public registerCommands(commands: Command[]): CommandRegistry {
    for (const command of commands) {
      this.registerCommand(command);
    }

    return this;
  }

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
