/**
 * @module Discord.js-Extended
 */

import { ExtendedClient } from './classes/ExtendedClient';
import { ClientDefaultHandlers } from './classes/events/ClientDefaultHandlers';
import { ExtraClientDefaultHandlers } from './classes/events/ExtraClientDefaultHandlers';
import { Templater } from './classes/abstract/Templater';
import { AsyncTemplater } from './classes/abstract/AsyncTemplater';
import { PresenceTemplater } from './classes/presence/PresenceTemplater';
import { PresenceManager } from './classes/presence/PresenceManager';
import { ConfigProvider } from './classes/config/ConfigProvider';
import { ConfigValidator } from './classes/config/ConfigValidator';
import { DataProvider, ClearableDataProvider } from './classes/data/DataProvider';
import { Command } from './classes/command/Command';
import { RegularCommand } from './classes/command/RegularCommand';
import { SlashCommand } from './classes/command/SlashCommand';
import { SlashCommandValidator } from './classes/command/SlashCommandValidator';
import { CommandGroup } from './classes/command/CommandGroup';
import { CommandRegistry } from './classes/command/CommandRegistry';
import { CommandDispatcher } from './classes/command/CommandDispatcher';
import { SlashCommandDeployer } from './classes/command/SlashCommandDeployer';
import { Localizer } from './classes/locale/Localizer';
import { GuildLocalizer } from './classes/locale/GuildLocalizer';

import * as DefaultCommands from './classes/command/default';

import { ExtendedClientOptions } from './interfaces/ExtendedClientOptions';
import { ExtendedClientEvents } from './interfaces/ExtendedClientEvents';
import { PresenceManagerOptions } from './interfaces/PresenceManagerOptions';
import { PresenceData } from './interfaces/PresenceData';
import { ConfigProviderOptions } from './interfaces/ConfigProviderOptions';
import { CommandInfo } from './interfaces/CommandInfo';
import { SlashCommandInfo } from './interfaces/SlashCommandInfo';
import { LocalizerOptions } from './interfaces/LocalizerOptions';

import { ConfigValue, ConfigCustomValidators, CommandTrigger, PresenceTemplaterGetters } from './types';

export {
  ExtendedClient,
  ClientDefaultHandlers,
  ExtraClientDefaultHandlers,
  Templater,
  AsyncTemplater,
  PresenceTemplater,
  PresenceManager,
  ConfigProvider,
  ConfigValidator,
  DataProvider,
  ClearableDataProvider,
  Command,
  RegularCommand,
  SlashCommand,
  SlashCommandValidator,
  CommandGroup,
  CommandRegistry,
  CommandDispatcher,
  SlashCommandDeployer,
  Localizer,
  GuildLocalizer,
  DefaultCommands,
  ExtendedClientOptions,
  ExtendedClientEvents,
  PresenceManagerOptions,
  PresenceData,
  ConfigProviderOptions,
  CommandInfo,
  SlashCommandInfo,
  LocalizerOptions,
  ConfigValue,
  ConfigCustomValidators,
  CommandTrigger,
  PresenceTemplaterGetters
};
