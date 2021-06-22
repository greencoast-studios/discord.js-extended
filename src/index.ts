import ExtendedClient from './classes/ExtendedClient';
import ClientDefaultHandlers from './classes/events/ClientDefaultHandlers';
import Templater from './classes/abstract/Templater';
import PresenceTemplater from './classes/presence/PresenceTemplater';
import PresenceManager from './classes/presence/PresenceManager';
import ConfigProvider from './classes/config/ConfigProvider';
import DataProvider from './classes/data/DataProvider';

import ExtendedClientOptions from './interfaces/ExtendedClientOptions';
import PresenceManagerOptions from './interfaces/PresenceManagerOptions';
import PresenceData from './interfaces/PresenceData';
import ConfigProviderOptions from './interfaces/ConfigProviderOptions';

export {
  ExtendedClient,
  ClientDefaultHandlers,
  Templater,
  PresenceTemplater,
  PresenceManager,
  ConfigProvider,
  DataProvider,
  ExtendedClientOptions,
  PresenceManagerOptions,
  PresenceData,
  ConfigProviderOptions
};
