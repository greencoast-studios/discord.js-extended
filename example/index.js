require('dotenv').config();
const { ExtendedClient } = require('@greencoast/discord.js-extended');

const client = new ExtendedClient({
  prefix: '?',
  owner: '123',
  debug: true
});

client.registerDefaultEvents();

client.login(process.env.DISCORD_TOKEN);
