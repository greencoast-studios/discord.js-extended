/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as DiscordMock from './discordMocks';
const RealDiscord = jest.requireActual('discord.js');

export default {
  Client: DiscordMock.ClientMock,
  Guild: DiscordMock.GuildMock,
  TextChannel: DiscordMock.TextChannelMock,
  User: DiscordMock.UserMock,
  Message: DiscordMock.MessageMock,
  MessageEmbed: DiscordMock.MessageEmbedMock,
  ShardClientUtil: DiscordMock.ShardClientUtilMock,
  Collection: RealDiscord.Collection
};
