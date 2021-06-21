require('dotenv').config();
const { ExtendedClient } = require('@greencoast/discord.js-extended');

const client = new ExtendedClient({
  prefix: '?',
  owner: '191330192868769793',
  debug: true,
  presence: {
    templates: ['{num_guilds} guilds!', '{num_members} members!', 'owner: {owner_name}', '{uptime}', '{ready_time}'],
    refreshInterval: 5000,
    status: 'dnd',
    type: 'COMPETING'
  }
});

client.registerDefaultEvents();

client.login(process.env.DISCORD_TOKEN);
