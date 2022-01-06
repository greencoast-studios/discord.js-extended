require('dotenv').config();
const path = require('path');
const logger = require('@greencoast/logger');
const { ShardingManager } = require('discord.js');
const { ConfigProvider } = require('@greencoast/discord.js-extended');

// The environment object contains the property: DISCORD_TOKEN with the bot's token.
const config = new ConfigProvider({
  env: process.env,
  configPath: path.join(__dirname, './config/settings.json'),
  types: {
    TOKEN: 'string'
  }
});

const manager = new ShardingManager('./index.js', { token: config.get('TOKEN') });

manager.on('shardCreate', (shard) => {
  logger.log(`Launched shard with ID: ${shard.id}`);
});

manager.spawn(2);
