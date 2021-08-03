/**
 * @module Discord.js-Extended
 */

import ExtendedClient from './classes/ExtendedClient';
import ClientDefaultHandlers from './classes/events/ClientDefaultHandlers';
import ExtraClientDefaultHandlers from './classes/events/ExtraClientDefaultHandlers';
import Templater from './classes/abstract/Templater';
import PresenceTemplater from './classes/presence/PresenceTemplater';
import PresenceManager from './classes/presence/PresenceManager';
import ConfigProvider from './classes/config/ConfigProvider';
import ConfigValidator from './classes/config/ConfigValidator';
import DataProvider from './classes/data/DataProvider';
import Command from './classes/command/Command';
import CommandGroup from './classes/command/CommandGroup';
import CommandRegistry from './classes/command/CommandRegistry';
import CommandDispatcher from './classes/command/CommandDispatcher';

import * as DefaultCommands from './classes/command/default';

import ExtendedClientOptions from './interfaces/ExtendedClientOptions';
import ExtendedClientEvents from './interfaces/ExtendedClientEvents';
import PresenceManagerOptions from './interfaces/PresenceManagerOptions';
import PresenceData from './interfaces/PresenceData';
import ConfigProviderOptions from './interfaces/ConfigProviderOptions';
import CommandInfo from './interfaces/CommandInfo';

import { ConfigValue } from './types';

export {
  ExtendedClient,
  ClientDefaultHandlers,
  ExtraClientDefaultHandlers,
  Templater,
  PresenceTemplater,
  PresenceManager,
  ConfigProvider,
  ConfigValidator,
  DataProvider,
  Command,
  CommandGroup,
  CommandRegistry,
  CommandDispatcher,
  DefaultCommands,
  ExtendedClientOptions,
  ExtendedClientEvents,
  PresenceManagerOptions,
  PresenceData,
  ConfigProviderOptions,
  CommandInfo,
  ConfigValue
};
