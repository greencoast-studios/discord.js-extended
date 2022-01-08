/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as DiscordMock from './discordMocks';
const RealDiscord = jest.requireActual('discord.js');

export default {
  Client: DiscordMock.ClientMock,
  Guild: DiscordMock.GuildMock,
  GuildMember: DiscordMock.GuildMemberMock,
  TextChannel: DiscordMock.TextChannelMock,
  DMChannel: DiscordMock.DMChannelMock,
  User: DiscordMock.UserMock,
  Message: DiscordMock.MessageMock,
  MessageEmbed: DiscordMock.MessageEmbedMock,
  ShardClientUtil: DiscordMock.ShardClientUtilMock,
  Interaction: DiscordMock.InteractionMock,
  Collection: RealDiscord.Collection
};
