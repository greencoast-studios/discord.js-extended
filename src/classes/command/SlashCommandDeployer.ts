import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import ExtendedClient from '../ExtendedClient';

class SlashCommandDeployer {
  public readonly client: ExtendedClient;

  public readonly rest: REST;

  constructor(client: ExtendedClient) {
    this.client = client;
    this.rest = new REST({ version: '9' }).setToken(this.client.token!);

    if (!this.client.testingGuildID) {
      this.client.emit('warn', 'You have not set a testingGuildID for your client. It is recommended to have one set up to automatically deploy slash commands to the testing server.');
    }
  }

  public async deployGlobally(): Promise<void> {
    const commands = this.client.registry.getSlashCommands();
    const commandBodies = commands.flatMap((command) => command.getAllDataBuilders());

    return this.rest.put(Routes.applicationCommands(this.client.user!.id), { body: commandBodies })
      .then(() => {
        this.client.emit('commandsDeployed', commands, null);
      })
      .catch((error) => {
        this.client.emit('error', error);
        throw error;
      });
  }

  public deployToGuild(guildID: string): Promise<void> {
    const commands = this.client.registry.getSlashCommands();
    const commandBodies = commands.flatMap((command) => command.getAllDataBuilders());

    return this.rest.put(Routes.applicationGuildCommands(this.client.user!.id, guildID), { body: commandBodies })
      .then(() => {
        this.client.emit('commandsDeployed', commands, guildID);
      })
      .catch((error) => {
        this.client.emit('error', error);
        throw error;
      });
  }

  public deployToGuilds(guildIDs: string[]): Promise<void[]> {
    return Promise.all(guildIDs.map((guildID) => this.deployToGuild(guildID)));
  }

  public deployToTestingGuild(): Promise<void> {
    if (!this.client.testingGuildID) {
      return Promise.reject(new Error('You have not set a testingGuildID for your client. It is recommended to have one set up to automatically deploy slash commands to the testing server.'));
    }

    return this.deployToGuild(this.client.testingGuildID);
  }
}

export default SlashCommandDeployer;
