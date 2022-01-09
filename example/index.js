require('dotenv').config();
const path = require('path');
const logger = require('@greencoast/logger');
const { Intents } = require('discord.js');
const { ExtendedClient, ConfigProvider } = require('@greencoast/discord.js-extended');
const LevelDataProvider = require('@greencoast/discord.js-extended/dist/providers/LevelDataProvider').default;

// The environment object contains the property: DISCORD_TOKEN with the bot's token.
const config = new ConfigProvider({
  env: process.env,
  configPath: path.join(__dirname, './config/settings.json'),
  default: {
    PREFIX: '!',
    OPTIONAL_NUMBER: null,
    MY_ENUM: 'enum1'
  },
  types: {
    TOKEN: 'string',
    PREFIX: 'string',
    OPTIONAL_NUMBER: ['number', 'null'], // A DISCORD_OPTIONAL_NUMBER env variable which will be cast to a number. It also accepts "null" as value.
    REQUIRED_BOOLEAN: 'boolean', // A DISCORD_REQUIRED_BOOLEAN env variable which will be cast to a boolean.
    MY_ENUM: 'string' // A DISCORD_MY_ENUM env variable that will use a custom validator.
  },
  customValidators: {
    MY_ENUM: (value) => {
      const validValues = ['enum1', 'enum2', 'enum3'];
      if (!validValues.includes(value)) {
        throw new TypeError(`${value} is not a valid value for MY_ENUM, you should use: ${validValues.join(', ')}`);
      }
    }
  }
});

const client = new ExtendedClient({
  prefix: config.get('PREFIX'),
  owner: '191330192868769793',
  debug: true,
  presence: {
    templates: ['{num_guilds} guilds!', 'random number {random}', '{num_members} members!', 'owner: {owner_name}', '{uptime}', '{ready_time}'],
    refreshInterval: 10000, // Presence gets changed every 10 seconds.
    status: 'dnd',
    type: 'COMPETING',
    customGetters: {
      random: async() => Math.random().toString()
    }
  },
  config,
  errorOwnerReporting: true,
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES],
  testingGuildID: '756628171494916098'
});

const dataProvider = new LevelDataProvider(client, path.join(__dirname, './data'));

client.registerDefaultEvents()
  .registerExtraDefaultEvents();

client.registry
  .registerDefaults()
  .registerGroups([
    ['util', 'Utility'],
    ['slash', 'Slash Commands']
  ])
  .registerCommandsIn(path.join(__dirname, './commands'));

client.on('ready', async() => {
  logger.info(`Listening for commands with prefix: ${client.prefix}`);

  await client.setDataProvider(dataProvider); // It would be recommended to set the data provider once the client is ready.
  await client.deployer.deployToTestingGuild(); // Deploy slash commands to the testing guild.
});

client.login(client.config.get('TOKEN'));
