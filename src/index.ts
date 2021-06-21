import ExtendedClient from './classes/ExtendedClient';
import ClientDefaultHandlers from './classes/events/ClientDefaultHandlers';
import Templater from './classes/abstract/Templater';
import PresenceTemplater from './classes/presence/PresenceTemplater';

import ExtendedClientOptions from './interfaces/ExtendedClientOptions';

import { version } from '../package.json';

export {
  ExtendedClient,
  ClientDefaultHandlers,
  Templater,
  PresenceTemplater,
  ExtendedClientOptions,
  version
};
