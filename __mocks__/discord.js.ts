/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Discord from 'discord.js';

const rateLimitMock: Discord.RateLimitData = {
  timeout: 123,
  limit: 123,
  timeDifference: 123,
  method: 'method',
  path: 'path',
  route: 'route'
};

class GuildMock {
  public name: string;

  constructor() {
    this.name = 'guild';
  }
}

class ClientMock {
  public options: any;
  public once: jest.Mock<any, any>;
  public on: jest.Mock<any, any>;
  public emit: jest.Mock<any, any>;
  public guilds: any;
  public users: any;
  public user: any;
  public uptime: number;
  public readyTimestamp: number;

  constructor(options: any) {
    this.options = options;
    this.once = jest.fn();
    this.on = jest.fn();
    this.emit = jest.fn();
    this.guilds = {
      cache: {
        reduce: (fn: any, initial: any) => {
          return [{ memberCount: 10 }, { memberCount: 5 }, { memberCount: 2 }].reduce(fn, initial);
        }
      }
    };
    this.users = {
      cache: {
        get: jest.fn(() => ({ username: 'owner' }))
      },
      get: jest.fn(),
      resolve: jest.fn(),
      fetch: jest.fn(() => Promise.resolve())
    };
    this.user = {
      username: 'client',
      setPresence: jest.fn(() => Promise.resolve())
    };
    this.uptime = 15341235221;
    this.readyTimestamp = 123123123123123;
  }
}

export {
  rateLimitMock
};

export default {
  Client: ClientMock,
  Guild: GuildMock
};
