import Discord from 'discord.js';
jest.mock('discord.js');

const clientMock = new Discord.Client();

const guildMock = new Discord.Guild(clientMock, {});
guildMock.name = 'Guild';

const rateLimitMock: Discord.RateLimitData = {
  timeout: 123,
  limit: 123,
  timeDifference: 123,
  method: 'method',
  path: 'path',
  route: 'route'
};

export {
  clientMock,
  guildMock,
  rateLimitMock
};
