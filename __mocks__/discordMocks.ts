import Discord from 'discord.js';

export const rateLimitMock: Discord.RateLimitData = {
  timeout: 123,
  limit: 123,
  method: 'method',
  path: 'path',
  route: 'route',
  global: true
};

export class GuildMock {
  public name: string;
  public id: string;

  constructor() {
    this.name = 'guild';
    this.id = Math.random().toString();
  }
}

export class ClientMock {
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
        },
        size: 3
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

export class UserMock {
  public username: string;
  public id: string;
  public bot: boolean;
  public send: jest.Mock<any, any>;

  constructor() {
    this.username = 'User';
    this.send = jest.fn();
    this.id = 'id';
    this.bot = false;
  }

  toString(): string {
    return this.username;
  }
}

export class GuildMemberMock {
  public displayName: string;

  constructor() {
    this.displayName = 'member';
  }
}

export const mockedPermissionsFor = {
  missing: jest.fn()
};

export class TextChannelMock {
  public permissionsFor: jest.Mock<any, any>;
  public send: jest.Mock<any, any>;
  public nsfw: boolean;
  public isText: jest.Mock<any, any>;

  constructor() {
    this.permissionsFor = jest.fn(() => mockedPermissionsFor);
    this.send = jest.fn(() => Promise.resolve());
    this.nsfw = false;
    this.isText = jest.fn(() => true);
  }
}

export class DMChannelMock {
  public send: jest.Mock<any, any>;
  public isText: jest.Mock<any, any>;

  constructor() {
    this.send = jest.fn(() => Promise.resolve());
    this.isText = jest.fn(() => true);
  }
}

export class MessageMock {
  public content: string;
  public channel: TextChannelMock;
  public author: UserMock;
  public partial: boolean;
  public reply: jest.Mock<any, any>;

  constructor() {
    this.content = 'Message';
    this.channel = new TextChannelMock();
    this.author = new UserMock();
    this.partial = false;
    this.reply = jest.fn();
  }
}

export class MessageEmbedMock {
  public setTitle: jest.Mock<any, any>;
  public setColor: jest.Mock<any, any>;
  public setThumbnail: jest.Mock<any, any>;
  public addField: jest.Mock<any, any>;
  public channel: TextChannelMock;

  constructor() {
    this.setTitle = jest.fn();
    this.setColor = jest.fn();
    this.setThumbnail = jest.fn();
    this.addField = jest.fn();
    this.channel = new TextChannelMock();
  }
}

export class ShardClientUtilMock {
  public fetchClientValues: jest.Mock<any, any>;

  constructor() {
    this.fetchClientValues = jest.fn();
  }
}

export class InteractionMock {
  public guild: GuildMock;
  public member: GuildMemberMock;
  public channel: TextChannelMock;

  constructor() {
    this.guild = new GuildMock();
    this.member = new GuildMemberMock();
    this.channel = new TextChannelMock();
  }
}
