/**
 * This contains all default commands available.
 * @packageDocumentation
 * @module DefaultCommands
 */

import { HelpRegularCommand } from './regular/HelpRegularCommand';
import { SetLocaleRegularCommand } from './regular/SetLocaleRegularCommand';

import { HelpSlashCommand } from './slash/HelpSlashCommand';
import { SetLocaleSlashCommand } from './slash/SetLocaleSlashCommand';

export const Regular = {
  HelpRegularCommand,
  SetLocaleRegularCommand
};

export const Slash = {
  HelpSlashCommand,
  SetLocaleSlashCommand
};

export {
  HelpRegularCommand,
  SetLocaleRegularCommand,

  HelpSlashCommand,
  SetLocaleSlashCommand
};
