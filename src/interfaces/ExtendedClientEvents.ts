import Discord, { ClientEvents } from 'discord.js';
import DataProvider from '../classes/data/DataProvider';
import Command from '../classes/command/Command';
import CommandGroup from '../classes/command/CommandGroup';
import PresenceData from '../interfaces/PresenceData';

interface ExtendedClientEvents extends ClientEvents {
  dataProviderAdd: [DataProvider],
  dataProviderClear: [Discord.Guild | null],
  commandExecute: [Command, Discord.Message],
  commandError: [Error, Command, Discord.Message],
  groupRegistered: [CommandGroup],
  commandRegistered: [Command],
  presenceUpdated: [string, PresenceData],
  presenceUpdateError: [Error, string, PresenceData],
  presenceRefreshInterval: [number | null]
}

export default ExtendedClientEvents;
