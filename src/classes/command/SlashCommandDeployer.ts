import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import ExtendedClient from '../ExtendedClient';

/**
 * A class to deploy slash commands to Discord. It can deploy globally or to a single
 * guild. Keep in mind that deploying globally can take up to 1 hour for changes to take effect,
 * while deploying for a single guild is immediate.
 */
class SlashCommandDeployer {
  /**
   * The client that this deployer will use.
   * @type {ExtendedClient}
   * @memberof SlashCommandDeployer
   */
  public readonly client: ExtendedClient;

  /**
   * A rest client to interact with the Discord API.
   * @type {REST}
   * @memberof SlashCommandDeployer
   */
  public readonly rest: REST;

  /**
   * @param client The client that this deployer will use.
   */
  constructor(client: ExtendedClient) {
    this.client = client;
    this.rest = new REST({ version: '9' }).setToken(this.client.token!);

    if (!this.client.testingGuildID) {
      this.client.emit('warn', 'You have not set a testingGuildID for your client. It is recommended to have one set up to automatically deploy slash commands to the testing server.');
    }
  }

  /**
   * Deploy the commands registered to this deployer's client registry globally. Keep in mind
   * that changes may take up to 1 hour to take effect.
   * @returns A promise that resolves once all the commands have been deployed.
   * @emits `client#commandDeployed`
   * @emits `client#error`
   */
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

  /**
   * Deploy the commands registered to this deployer's client registry to a given guild.
   * @param guildID The ID of the [guild](https://discord.js.org/#/docs/discord.js/stable/class/Guild) to deploy the commands to.
   * @returns A promise that resolves once all the commands have been deployed.
   * @emits `client#commandDeployed`
   * @emits `client#error`
   */
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

  /**
   * Deploy the commands registered to this deployer's client registry to multiple guilds.
   * @param guildIDs An array with the IDs of the [guilds](https://discord.js.org/#/docs/discord.js/stable/class/Guild) to deploy the commands to.
   * @returns A promise that resolves once all the commands have been deployed.
   * @emits `client#commandDeployed`
   * @emits `client#error`
   */
  public deployToGuilds(guildIDs: string[]): Promise<void[]> {
    return Promise.all(guildIDs.map((guildID) => this.deployToGuild(guildID)));
  }

  /**
   * Deploy the commands registered to this deployer's client registry to the testing guild defined
   * in the client.
   * @returns A promise that resolves once all the commands have been deployed.
   * @emits `client#commandDeployed`
   * @emits `client#error`
   */
  public deployToTestingGuild(): Promise<void> {
    if (!this.client.testingGuildID) {
      return Promise.reject(new Error('You have not set a testingGuildID for your client. It is recommended to have one set up to automatically deploy slash commands to the testing server.'));
    }

    return this.deployToGuild(this.client.testingGuildID);
  }
}

export default SlashCommandDeployer;
