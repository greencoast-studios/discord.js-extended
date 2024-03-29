import { ClientEvents, Guild } from 'discord.js';
import { DataProvider } from '../classes/data/DataProvider';
import { Command } from '../classes/command/Command';
import { SlashCommand } from '../classes/command/SlashCommand';
import { CommandGroup } from '../classes/command/CommandGroup';
import { PresenceData } from '../interfaces/PresenceData';
import { CommandTrigger } from '../types';

/**
 * The events handled by the {@link ExtendedClient}.
 */
export interface ExtendedClientEvents extends ClientEvents {
  /**
   * Emitted whenever the data provider is added to this client.
   */
  dataProviderAdd: [DataProvider],

  /**
   * Emitted whenever the client's data provider is cleared.
   */
  dataProviderClear: [Guild | null],

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
  commandExecute: [Command<CommandTrigger>, CommandTrigger],

  /**
   * Emitted whenever a command's execution throws.
   */
  commandError: [unknown, Command<CommandTrigger>, CommandTrigger],

  /**
   * Emitted whenever a command group is registered to this client's command registry.
   */
  groupRegistered: [CommandGroup],

  /**
   * Emitted whenever a command is registered to this client's command registry.
   */
  commandRegistered: [Command<CommandTrigger>],

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
  presenceRefreshInterval: [number | null],

  /**
   * Emitted whenever slash commands have been deployed.
   */
  commandsDeployed: [SlashCommand[], string | null]
}
