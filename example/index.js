require('dotenv').config();
const path = require('path');
const logger = require('@greencoast/logger');
const { ExtendedClient, ConfigProvider } = require('@greencoast/discord.js-extended');
const LevelDataProvider = require('@greencoast/discord.js-extended/dist/providers/LevelDataProvider').default;

const config = new ConfigProvider({ env: process.env, configPath: path.join(__dirname, './config/settings.json') });

const client = new ExtendedClient({
  prefix: config.get('PREFIX'),
  owner: '191330192868769793',
  debug: true,
  presence: {
    templates: ['{num_guilds} guilds!', '{num_members} members!', 'owner: {owner_name}', '{uptime}', '{ready_time}'],
    refreshInterval: 5000,
    status: 'dnd',
    type: 'COMPETING'
  },
  config,
  errorOwnerReporting: true
});

const dataProvider = new LevelDataProvider(client, path.join(__dirname, './data'));

client.registerDefaultEvents().registerExtraDefaultEvents();

client.registry
  .registerDefaults()
  .registerGroups([
    ['util', 'Utility']
  ])
  .registerCommandsIn(path.join(__dirname, './commands'));

client.on('ready', async() => {
  logger.info(`Listening for commands with prefix: ${client.prefix}`);

  await client.setDataProvider(dataProvider);
});

client.login(client.config.get('TOKEN'));
