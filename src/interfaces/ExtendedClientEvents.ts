import Discord, { ClientEvents } from 'discord.js';
import DataProvider from '../classes/data/DataProvider';
import Command from '../classes/command/Command';

interface ExtendedClientEvents extends ClientEvents {
  dataProviderAdd: [DataProvider],
  commandExecute: [Command, Discord.Message]
  commandError: [Error, Command, Discord.Message]
}

export default ExtendedClientEvents;
