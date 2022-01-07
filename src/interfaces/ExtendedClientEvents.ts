import Discord, { ClientEvents } from 'discord.js';
import DataProvider from '../classes/data/DataProvider';
import Command from '../classes/command/Command';
import CommandGroup from '../classes/command/CommandGroup';
import PresenceData from '../interfaces/PresenceData';

/**
 * The events handled by the {@link ExtendedClient}.
 */
interface ExtendedClientEvents extends ClientEvents {
  /**
   * Emitted whenever the data provider is added to this client.
   */
  dataProviderAdd: [DataProvider],

  /**
   * Emitted whenever the client's data provider is cleared.
   */
  dataProviderClear: [Discord.Guild | null],

  /**
   * Emitted whenever the client's data provider is initialized.
   */
  dataProviderInit: [DataProvider],

  /**
   * Emitted whenever the client's data provider is destroyed.
   */
  dataProviderDestroy: [DataProvider],

  /**
   * Emitted whenever a command is executed.
   */
  commandExecute: [Command, Discord.Message],

  /**
   * Emitted whenever a command's execution throws.
   */
  commandError: [unknown, Command, Discord.Message],

  /**
   * Emitted whenever a command group is registered to this client's command registry.
   */
  groupRegistered: [CommandGroup],

  /**
   * Emitted whenever a command is registered to this client's command registry.
   */
  commandRegistered: [Command],

  /**
   * Emitted whenever this client's presence status is updated.
   */
  presenceUpdated: [string, PresenceData],

  /**
   * Emitted whenever updating this client's presence status throws.
   */
  presenceUpdateError: [unknown, string, PresenceData],

  /**
   * Emitted whenever this client's presence manager updates its presence refresh interval.
   */
  presenceRefreshInterval: [number | null]
}

export default ExtendedClientEvents;
