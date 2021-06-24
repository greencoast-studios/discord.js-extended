import Discord from 'discord.js';
import PresenceManager from './presence/PresenceManager';
import ConfigProvider from './config/ConfigProvider';
import DataProvider from './data/DataProvider';
import CommandRegistry from './command/CommandRegistry';
import CommandDispatcher from './command/CommandDispatcher';
import ExtendedClientOptions from '../interfaces/ExtendedClientOptions';
import ClientDefaultHandlers from './events/ClientDefaultHandlers';

/**
 * A Discord.js Client extension.
 */
class ExtendedClient extends Discord.Client {
  public override options!: ExtendedClientOptions;
  public presenceManager: PresenceManager;
  public dataProvider: DataProvider | null;
  public registry: CommandRegistry;
  public dispatcher: CommandDispatcher;

  /**
   * @param options The client's options. Defaults to an empty object.
   */
  constructor(options: ExtendedClientOptions = {}) {
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

    this.fetchOwner();
    this.registerMessageHandler();
  }

  /**
   * The client's prefix.
   *
   * @readonly
   * @type {string}
   * @memberof ExtendedClient
   */
  get prefix(): string {
    return this.options.prefix!; // Default value in constructor.
  }

  /**
   * Whether the client has debug-mode enabled.
   *
   * @readonly
   * @type {boolean}
   * @memberof ExtendedClient
   */
  get debug(): boolean {
    return this.options.debug!; // Default value in constructor.
  }

  /**
   * The client's owner (if any).
   *
   * @readonly
   * @type {(Discord.User | undefined)}
   * @memberof ExtendedClient
   */
  get owner(): Discord.User | undefined {
    if (!this.options.owner) {
      return;
    }

    return this.users.cache.get(this.options.owner);
  }

  /**
   * The client's config provider (if any).
   *
   * @readonly
   * @type {(ConfigProvider | undefined)}
   * @memberof ExtendedClient
   */
  get config(): ConfigProvider | undefined {
    return this.options.config;
  }

  /**
   * Whether command error reporting should be notified to the client's owner. An owner must be set for this option to work.
   *
   * @readonly
   * @type {boolean}
   * @memberof ExtendedClient
   */
  get errorOwnerReporting(): boolean {
    return this.options.errorOwnerReporting!; // Default value in constructor.
  }

  /**
   * Set the client's data provider. It is not necessary to initialize the provider as it is done here.
   * @param dataProvider The data provider.
   * @returns A promise that resolves with the data provider initialized.
   */
  public async setDataProvider(dataProvider: DataProvider): Promise<DataProvider> {
    await dataProvider.init();
    this.dataProvider = dataProvider;
    return this.dataProvider;
  }

  /**
   * Test whether the specified user is the client's owner.
   *
   * @param user The user to test.
   * @returns Whether the tested user is the client's owner.
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
   * @returns The client's instance for method chaining.
   */
  public registerDefaultEvents(): ExtendedClient {
    if (this.options.debug) {
      this.on('debug', ClientDefaultHandlers.onDebug);
    }

    this.on('error', ClientDefaultHandlers.onError);
    this.on('guildCreate', ClientDefaultHandlers.onGuildCreate);
    this.on('guildDelete', ClientDefaultHandlers.onGuildDelete);
    this.on('guildUnavailable', ClientDefaultHandlers.onGuildUnavailable);
    this.on('invalidated', ClientDefaultHandlers.onInvalidated);
    this.on('rateLimit', ClientDefaultHandlers.onRateLimit);
    this.on('ready', ClientDefaultHandlers.onReady);
    this.on('warn', ClientDefaultHandlers.onWarn);

    return this;
  }

  /**
   * Fetch the owner's user object. This will be automatically cached.
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
   * Register the message event handler for CommandDispatcher.
   */
  private registerMessageHandler(): void {
    this.on('message', (message) => this.dispatcher.handleMessage(message));
  }
}

export default ExtendedClient;
