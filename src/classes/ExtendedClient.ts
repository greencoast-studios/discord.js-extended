/* eslint-disable @typescript-eslint/no-explicit-any */
import Discord from 'discord.js';
import PresenceManager from './presence/PresenceManager';
import ConfigProvider from './config/ConfigProvider';
import DataProvider from './data/DataProvider';
import CommandRegistry from './command/CommandRegistry';
import CommandDispatcher from './command/CommandDispatcher';
import SlashCommandDeployer from './command/SlashCommandDeployer';
import ClientDefaultHandlers from './events/ClientDefaultHandlers';
import ExtraClientDefaultHandlers from './events/ExtraClientDefaultHandlers';
import ExtendedClientOptions from '../interfaces/ExtendedClientOptions';
import ExtendedClientEvents from '../interfaces/ExtendedClientEvents';

// Interface declaration to extend events emitted by ExtendedClient.
export declare interface ExtendedClient {
  on<K extends keyof ExtendedClientEvents>(event: K, listener: (...args: ExtendedClientEvents[K]) => void): this;
  on<S extends string | symbol>(
    event: Exclude<S, keyof ExtendedClientEvents>,
    listener: (...args: any[]) => void
  ): this;

  once<K extends keyof ExtendedClientEvents>(event: K, listener: (...args: ExtendedClientEvents[K]) => void): this;
  once<S extends string | symbol>(
    event: Exclude<S, keyof ExtendedClientEvents>,
    listener: (...args: any[]) => void
  ): this;

  emit<K extends keyof ExtendedClientEvents>(event: K, ...args: ExtendedClientEvents[K]): boolean;
  emit<S extends string | symbol>(event: Exclude<S, keyof ExtendedClientEvents>, ...args: any[]): boolean;

  off<K extends keyof ExtendedClientEvents>(event: K, listener: (...args: ExtendedClientEvents[K]) => void): this;
  off<S extends string | symbol>(
    event: Exclude<S, keyof ExtendedClientEvents>,
    listener: (...args: any[]) => void
  ): this;

  removeAllListeners<K extends keyof ExtendedClientEvents>(event?: K): this;
  removeAllListeners<S extends string | symbol>(event?: Exclude<S, keyof ExtendedClientEvents>): this;
}

/**
 * A Discord.js Client extension.
 */
export class ExtendedClient extends Discord.Client {
  /**
   * This client's options.
   * @memberof ExtendedClient
   */
  public override options!: ExtendedClientOptions;

  /**
   * This client's presence manager.
   * @type {PresenceManager}
   * @memberof ExtendedClient
   */
  public presenceManager: PresenceManager;

  /**
   * This client's data provider.
   * @type {(DataProvider | null)}
   * @memberof ExtendedClient
   */
  public dataProvider: DataProvider | null;

  /**
   * This client's command registry.
   * @type {CommandRegistry}
   * @memberof ExtendedClient
   */
  public registry: CommandRegistry;

  /**
   * This client's command dispatcher.
   * @type {CommandDispatcher}
   * @memberof ExtendedClient
   */
  public dispatcher: CommandDispatcher;

  /**
   * This client's slash command deployer.
   * @type {SlashCommandDeployer}
   * @memberof ExtendedClient
   */
  public deployer: SlashCommandDeployer;

  /**
   * @param options The client's options. Defaults to an empty object.
   */
  // eslint-disable-next-line max-statements
  constructor(options: ExtendedClientOptions = { intents: [] }) {
    if (!options.prefix) {
      options.prefix = '!';
    }
    if (!options.debug) {
      options.debug = false;
    }
    if (!options.owner) {
      options.owner = null;
    }
    if (!options.errorOwnerReporting) {
      options.errorOwnerReporting = false;
    }
    super(options);

    this.presenceManager = new PresenceManager(this, options.presence);
    this.dataProvider = null;
    this.registry = new CommandRegistry(this);
    this.dispatcher = new CommandDispatcher(this, this.registry);
    this.deployer = new SlashCommandDeployer(this);

    this.fetchOwner();
    this.registerMessageHandler().registerInteractionHandler();
  }

  /**
   * The client's prefix.
   * @readonly
   * @type {string}
   * @memberof ExtendedClient
   * @defaultValue `!`
   */
  get prefix(): string {
    return this.options.prefix!;
  }

  /**
   * Whether the client has debug-mode enabled.
   * @readonly
   * @type {boolean}
   * @memberof ExtendedClient
   * @defaultValue `false`
   */
  get debug(): boolean {
    return this.options.debug!;
  }

  /**
   * The client's owner (if any).
   * @readonly
   * @type {(Discord.User | undefined)}
   * @memberof ExtendedClient
   * @defaultValue `null`
   */
  get owner(): Discord.User | undefined {
    if (!this.options.owner) {
      return;
    }

    return this.users.cache.get(this.options.owner);
  }

  /**
   * The client's config provider (if any).
   * @readonly
   * @type {(ConfigProvider | undefined)}
   * @memberof ExtendedClient
   */
  get config(): ConfigProvider | undefined {
    return this.options.config;
  }

  /**
   * Whether command error reporting should be notified to the client's owner.
   * An owner must be set for this option to work.
   * @readonly
   * @type {boolean}
   * @memberof ExtendedClient
   * @defaultValue `false`
   */
  get errorOwnerReporting(): boolean {
    return this.options.errorOwnerReporting!;
  }

  /**
   * The ID of the guild used to test this bot. It is not required, however
   * it is recommended to specify one. This is used to automatically deploy
   * slash commands to the testing guild.
   * @readonly
   * @type {string | undefined}
   * @memberof ExtendedClient
   */
  get testingGuildID(): string | undefined {
    return this.options.testingGuildID;
  }

  /**
   * Set the client's data provider. It is not necessary to initialize the provider as it is done here.
   * @param dataProvider The data provider.
   * @returns A promise that resolves with the data provider initialized.
   * @emits `dataProviderAdd`
   */
  public async setDataProvider(dataProvider: DataProvider): Promise<DataProvider> {
    await dataProvider.init();
    this.dataProvider = dataProvider;
    this.emit('dataProviderAdd', dataProvider);
    return this.dataProvider;
  }

  /**
   * Test whether the specified user is the client's owner.
   * @param user The [user](https://discord.js.org/#/docs/main/stable/class/User) to test.
   * @returns Whether the tested user is the client's owner.
   * @throws Throws if the user cannot be resolved.
   */
  public isOwner(user: Discord.UserResolvable): boolean {
    if (!this.options.owner) {
      return false;
    }

    const resolvedUser = this.users.resolve(user);

    if (!resolvedUser) {
      throw new Error('Could not resolve user.');
    }

    return resolvedUser.id === this.options.owner;
  }

  /**
   * Register the default event handlers. For more information, check {@link ClientDefaultHandlers}.
   * @returns This client.
   */
  public registerDefaultEvents(): this {
    if (this.options.debug) {
      this.on('debug', ClientDefaultHandlers.onDebug);
    }

    this.on('error', ClientDefaultHandlers.onError);
    this.on('guildCreate', ClientDefaultHandlers.onGuildCreate);
    this.on('guildDelete', ClientDefaultHandlers.onGuildDelete);
    this.on('guildUnavailable', ClientDefaultHandlers.onGuildUnavailable);
    this.on('invalidated', ClientDefaultHandlers.onInvalidated);
    this.on('invalidRequestWarning', ClientDefaultHandlers.onInvalidRequestWarning);
    this.on('rateLimit', ClientDefaultHandlers.onRateLimit);
    this.on('ready', ClientDefaultHandlers.onReady);
    this.on('warn', ClientDefaultHandlers.onWarn);

    return this;
  }

  /**
   * Register the default event handlers for the custom events for this ExtendedClient.
   * For more information, check {@link ExtraClientDefaultHandlers}.
   * @returns This client.
   */
  public registerExtraDefaultEvents(): this {
    this.on('dataProviderAdd', ExtraClientDefaultHandlers.onDataProviderAdd);
    this.on('dataProviderClear', ExtraClientDefaultHandlers.onDataProviderClear);
    this.on('dataProviderInit', ExtraClientDefaultHandlers.onDataProviderInit);
    this.on('dataProviderDestroy', ExtraClientDefaultHandlers.onDataProviderDestroy);
    this.on('commandExecute', ExtraClientDefaultHandlers.onCommandExecute);
    this.on('commandError', ExtraClientDefaultHandlers.onCommandError);
    this.on('groupRegistered', ExtraClientDefaultHandlers.onGroupRegistered);
    this.on('commandRegistered', ExtraClientDefaultHandlers.onCommandRegistered);
    this.on('presenceUpdated', ExtraClientDefaultHandlers.onPresenceUpdated);
    this.on('presenceUpdateError', ExtraClientDefaultHandlers.onPresenceUpdateError);
    this.on('presenceRefreshInterval', ExtraClientDefaultHandlers.onPresenceRefreshInterval);
    this.on('commandsDeployed', ExtraClientDefaultHandlers.onCommandsDeployed);

    return this;
  }

  /**
   * Fetch the owner's user object. This will be automatically cached.
   * @emits `warn`
   * @emits `error`
   */
  private fetchOwner(): void {
    const { owner } = this.options;

    if (!owner) {
      return;
    }

    this.once('ready', () => {
      return this.users.fetch(owner)
        .catch((error) => {
          this.emit('warn', `Could not fetch owner ${owner}.`);
          this.emit('error', error);
        });
    });
  }

  /**
   * Register the message event handler for the {@link CommandDispatcher}.
   * @returns This client.
   */
  private registerMessageHandler(): this {
    this.on('messageCreate', (message) => this.dispatcher.handleMessage(message));

    return this;
  }

  /**
   * Register the interaction event handler for the {@link CommandDispatcher}.
   * @return This client.
   */
  private registerInteractionHandler(): this {
    this.on('interactionCreate', (interaction) => this.dispatcher.handleInteraction(interaction));

    return this;
  }

  /**
   * Emitted whenever the data provider is added to this client.
   * @event
   */
  public static readonly dataProviderAdd = 'dataProviderAdd';

  /**
   * Emitted whenever the client's data provider is cleared.
   * @event
   */
  public static readonly dataProviderClear = 'dataProviderClear';

  /**
   * Emitted whenever the client's data provider is initialized.
   * @event
   */
  public static readonly dataProviderInit = 'dataProviderInit';

  /**
   * Emitted whenever the client's data provider is destroyed.
   * @event
   */
  public static readonly dataProviderDestroy = 'dataProviderDestroy';

  /**
   * Emitted whenever a command is executed.
   * @event
   */
  public static readonly commandExecute = 'commandExecute';

  /**
   * Emitted whenever a command's execution throws.
   * @event
   */
  public static readonly commandError = 'commandError';

  /**
   * Emitted whenever a command group is registered to this client's command registry.
   * @event
   */
  public static readonly groupRegistered = 'groupRegistered';

  /**
   * Emitted whenever a command is registered to this client's command registry.
   * @event
   */
  public static readonly commandRegistered = 'commandRegistered';

  /**
   * Emitted whenever this client's presence status is updated.
   * @event
   */
  public static readonly presenceUpdated = 'presenceUpdated';

  /**
   * Emitted whenever updating this client's presence status throws.
   * @event
   */
  public static readonly presenceUpdateError = 'presenceUpdateError';

  /**
   * Emitted whenever this client's presence manager updates its presence refresh interval.
   * @event
   */
  public static readonly presenceRefreshInterval = 'presenceRefreshInterval';
}

export default ExtendedClient;
