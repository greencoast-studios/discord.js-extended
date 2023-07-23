const RealDiscord = jest.requireActual('discord.js');

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
  public once: jest.Mock;
  public on: jest.Mock;
  public emit: jest.Mock;
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
        map: (fn: any) => {
          return [{ id: '1' }, { id: '2' }, { id: '3' }].map(fn);
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
  public send: jest.Mock;

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
  public permissionsFor: jest.Mock;
  public send: jest.Mock;
  public nsfw: boolean;
  public isTextBased: jest.Mock;

  constructor() {
    this.permissionsFor = jest.fn(() => mockedPermissionsFor);
    this.send = jest.fn(() => Promise.resolve());
    this.nsfw = false;
    this.isTextBased = jest.fn(() => true);
  }
}

export class DMChannelMock {
  public send: jest.Mock;
  public isText: jest.Mock;

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
  public reply: jest.Mock;

  constructor() {
    this.content = 'Message';
    this.channel = new TextChannelMock();
    this.author = new UserMock();
    this.partial = false;
    this.reply = jest.fn();
  }
}

export class MessageEmbedMock {
  public setTitle: jest.Mock;
  public setColor: jest.Mock;
  public setThumbnail: jest.Mock;
  public addField: jest.Mock;
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
  public fetchClientValues: jest.Mock;

  constructor() {
    this.fetchClientValues = jest.fn();
  }
}

export class InteractionMock {
  public guild: GuildMock;
  public member: GuildMemberMock;
  public channel: TextChannelMock;
  public isCommand: jest.Mock;
  public isChatInputCommand: jest.Mock;
  public inGuild: jest.Mock;
  public reply: jest.Mock;
  public editReply: jest.Mock;
  public options: unknown;
  public replied: boolean;
  public deferred: boolean;

  constructor() {
    this.guild = new GuildMock();
    this.member = new GuildMemberMock();
    this.channel = new TextChannelMock();
    this.isCommand = jest.fn();
    this.isChatInputCommand = jest.fn();
    this.inGuild = jest.fn();
    this.reply = jest.fn();
    this.editReply = jest.fn();
    this.options = {
      getString: jest.fn()
    };
    this.replied = false;
    this.deferred = false;
  }
}

export const mockDiscordJs = () => {
  jest.mock('discord.js', () => {
    const mock = {
      ...RealDiscord,
      Client: ClientMock,
      Guild: GuildMock,
      GuildMember: GuildMemberMock,
      TextChannel: TextChannelMock,
      DMChannel: DMChannelMock,
      User: UserMock,
      Message: MessageMock,
      MessageEmbed: MessageEmbedMock,
      ShardClientUtil: ShardClientUtilMock,
      Interaction: InteractionMock,
      Collection: RealDiscord.Collection,
      Permissions: RealDiscord.Permissions
    };

    return {
      __esModule: true,
      ...mock,
      default: mock
    };
  });
};
