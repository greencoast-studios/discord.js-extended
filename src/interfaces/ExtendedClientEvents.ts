import { ClientEvents } from 'discord.js';
import DataProvider from '../classes/data/DataProvider';

interface ExtendedClientEvents extends ClientEvents {
  dataProviderAdd: [DataProvider]
}

export default ExtendedClientEvents;
