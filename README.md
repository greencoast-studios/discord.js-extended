[![ci-build-status](https://img.shields.io/github/workflow/status/greencoast-studios/discord.js-extended/CI?logo=github)](https://github.com/greencoast-studios/discord.js-extended)
[![issues](https://img.shields.io/github/issues/greencoast-studios/discord.js-extended?logo=github)](https://github.com/greencoast-studios/discord.js-extended)
[![bundle-size](https://img.shields.io/bundlephobia/min/@greencoast/discord.js-extended)](https://www.npmjs.com/package/@greencoast/discord.js-extended)
[![node-version](https://img.shields.io/node/v/@greencoast/discord.js-extended?logo=Node.js&color=green)](https://www.npmjs.com/package/@greencoast/discord.js-extended)
[![version](https://img.shields.io/npm/v/@greencoast/discord.js-extended?logo=npm)](https://www.npmjs.com/package/@greencoast/discord.js-extended)
[![djs-version](https://img.shields.io/npm/dependency-version/@greencoast/discord.js-extended/peer/discord.js?logo=npm)](https://www.npmjs.com/package/@greencoast/discord.js-extended)
[![downloads-week](https://img.shields.io/npm/dw/@greencoast/discord.js-extended?logo=npm)](https://www.npmjs.com/package/@greencoast/discord.js-extended)
[![downloads-total](https://img.shields.io/npm/dt/@greencoast/discord.js-extended?logo=npm)](https://www.npmjs.com/package/@greencoast/discord.js-extended)

# Discord.js - Extended

[discord.js-extended](https://github.com/greencoast-studios/discord.js-extended) is a library that facilitates the repetitive tasks when creating Discord bots with [Discord.js](https://discord.js.org/#/). Used by [Greencoast Studios](https://greencoaststudios.com).

Heavily inspired by [discord.js-commando](https://www.npmjs.com/package/discord.js-commando), it includes similar design decisions, however this adds certain functionality that isn't available like a configuration provider and automatic presence management. This package does not include all functionality provided by Commando, in fact, Commando is way more powerful than this library. Nevertheless, this was built to make it easier for us to quickly build bots without having to repeat ourselves that much.

This was made for [Discord.js](https://discord.js.org/#/) v13.5, however any v13 should work fine.

## Usage

You can visit the [documentation site](https://docs.greencoaststudios.com/discord.js-extended/master) to see what this library offers, check the [example](https://github.com/greencoast-studios/discord.js-extended/tree/master/example) bot, or check the [bots using this section](#bots-using-this) to see even more examples.

### Installation

This package does not install [Discord.js](https://discord.js.org/#/), so you should install it yourself.

You can install this package with:

```text
npm install discord.js @greencoast/discord.js-extended
```

## Configuring your Client

This package covers client configuration from environment variables and/or JSON files through the [ConfigProvider](https://docs.greencoaststudios.com/discord.js-extended/master/classes/discord_js_extended.configprovider.html) class, which makes it easy to add configuration to a bot. Consider checking the [documentation page](https://docs.greencoaststudios.com/discord.js-extended/master/classes/discord_js_extended.configprovider.html) to see how to use this.

You may also specify custom validators for even more control of how config is provided to your bot. Simply, pass a `customValidators` property to the `ConfigProvider` options, and map the key of the config to its validator function. Your validator function should
throw a `TypeError` if the given value is invalid based on your criteria.

An example of a bot's configuration may be as follows:

```js
const path = require('path');
const { ExtendedClient, ConfigProvider } = require('@greencoast/discord.js-extended');
const { Intents } = require('discord.js');

const config = new ConfigProvider({
  env: process.env, // This adds the environment variables to the config.
  configPath: path.join(__dirname, './config/settings.json'), // This is the location of the JSON file that includes the config.
  default: {
    PREFIX: '!', // Adds a default value for the PREFIX config.
    TOKEN: null, // Adds a default value for the TOKEN config.
    MY_ID: 123,
    OPTIONAL_FLAG: false,
    MY_ENUM: 'enum1'
  },
  types: { // These are the types of the configuration. The provider validates that the config receives the proper configuration types.
    PREFIX: 'string',
    TOKEN: ['string', 'null'], // With a 'null' type, you can pass 'null' to have it as null.
    MY_ID: 'number',
    OPTIONAL_FLAG: ['boolean', 'null'],
    MY_ENUM: 'string',
    MY_NUM_ARRAY: 'number[]' // You can pass arrays through JSON or comma-separated values through env variables.
  },
  customValidators: { // These are the custom validators to use instead of the basic type based validator.
    MY_ENUM: (value) => {
      const validValues = ['enum1', 'enum2', 'enum3'];
      if (!validValues.includes(value)) {
        throw new TypeError(`${value} is not a valid value for MY_ENUM, you should use: ${validValues.join(', ')}`);
      }
    }
  }
});

const client = new ExtendedClient({
  config,
  intents: [Intents.FLAGS.GUILDS]
});
```

Make sure to check the [documentation page](https://docs.greencoaststudios.com/discord.js-extended/master/classes/discord_js_extended.configprovider.html) to see the structure of the JSON file required and the type of environment variables that are supported.

### Creating a Client

This package exports an extension of the regular [Discord.js Client](https://discord.js.org/#/docs/discord.js/stable/class/Client) that contains all the extended functionality. You can create one by using the following:

```js
const path = require('path');
const { ExtendedClient, ConfigProvider } = require('@greencoast/discord.js-extended');
const { Intents } = require('discord.js');

const config = new ConfigProvider({
  env: process.env,
  configPath: path.join(__dirname, './config/settings.json'),
  default: {
    KEY: 'value'
  }
});

const client = new ExtendedClient({
  config, // The config provider instance used by the bot.
  debug: true, // Enable debug-mode.
  owner: '123', // The ID of the bot's owner.
  prefix: '!', // The bot's prefix to be used.
  presence: {
    templates: ['presence 1', 'presence 2', '{custom_key} hi!'], // The presence statuses used by this bot.
    refreshInterval: 3600000, // Update the bot's presence every hour.
    customGetters: {
      custom_key: async() => Math.random().toString() // Define custom getters for keys to replace on the presence strings.
    }
  },
  errorOwnerReporting: true, // Sends DMs to the bot's owner whenever a command throws an error.
  intents: [Intents.FLAGS.GUILDS]
});

client.login(<YOUR_DISCORD_TOKEN_HERE>);
```

The `presence` option in the client's constructor allows you to configure the presence statuses to be used by the bots. These presence statuses may include information from the bot, such as: number of guilds connected to, number of commands, the time the bot went online, or even custom data... Consider checking the [documentation page](https://docs.greencoaststudios.com/discord.js-extended/master/classes/discord_js_extended.presencetemplater.html) to see what information you can include in your presence statuses
and how to add custom getters for your own presence messages.

### Adding defaults to your Client

You can register default handlers for the [Discord.js Client](https://docs.greencoaststudios.com/discord.js-extended/master/classes/discord_js_extended.clientdefaulthandlers.html) events, as well as the [ExtendedClient](https://docs.greencoaststudios.com/discord.js-extended/master/classes/discord_js_extended.extraclientdefaulthandlers.html) custom events.

```js
client.registerDefaultEvents().registerExtraDefaultEvents();
```

The package also comes with default commands that you can use on your bot. Check the [Default Commands](https://docs.greencoaststudios.com/discord.js-extended/master/modules/defaultcommands.html) to see the available commands you can register right away. You can register them like:

```js
client.registry.registerDefaults();
```

### Adding a Database Provider to your Client

The package comes with persistent data functionality that can be enabled. The [DataProvider](https://docs.greencoaststudios.com/discord.js-extended/master/classes/discord_js_extended.dataprovider.html) is an abstract class that serves as common interface to use. By default, data is stored by guild, but you can also store/get data on a global scope.

You can use the following methods:

```js
await client.dataProvider.get(guild, 'key'); // Get a value for 'key' in guild.
await client.dataProvider.set(guild, 'key', 'value'); // Set 'value' for 'key' in guild.
await client.dataProvider.delete(guild, 'key'); // Delete a key-value pair for 'key' in guild.
await client.dataProvider.clear(guild); // Clear all data in a guild.

await client.dataProvider.getGlobal('key'); // Get a value for 'key' in the global scope.
await client.dataProvider.setGlobal('key', 'value'); // Set 'value' for 'key' in the global scope.
await client.dataProvider.deleteGlobal('key'); // Delete a key-value pair for 'key' in the global scope.
await client.dataProvider.clearGlobal(); // Clear all data in the global scope.
```

> You need to set up a data provider before being able to use any of these methods.

#### LevelDataProvider

[LevelDataProvider](https://docs.greencoaststudios.com/discord.js-extended/master/classes/dataproviders.leveldataprovider.html) is a data provider implemented with a [LevelDB](https://www.npmjs.com/package/level) backend. In order to use this, you need to install [level](https://www.npmjs.com/package/level).
This data provider was made for `level@7.0.1` but any v7 should work.

```text
npm install level
```

In order to set up this data provider, you need to import it and add it to your client.

```js
const LevelDataProvider = require('@greencoast/discord.js-extended/dist/providers/LevelDataProvider').default;

const provider = new LevelDataProvider(client, 'database_location');

client.on('ready', async() => {
  await client.setProvider(provider);
});
```

#### RedisDataProvider

[RedisDataProvider](https://docs.greencoaststudios.com/discord.js-extended/master/classes/dataproviders.redisdataprovider.html) is a data provider implemented with a [Redis](https://www.npmjs.com/package/redis) backend. In order to use this, you need to install [redis](https://www.npmjs.com/package/redis).
This data provider was made for `redis@4.0.2` but any v4 should work.

```text
npm install redis
```

In order to set up this data provider, you need to import it and add it to your client.

```js
const RedisDataProvider = require('@greencoast/discord.js-extended/dist/providers/RedisDataProvider').default;

const provider = new RedisDataProvider(client, { 
  url: 'redis://alice:foobared@awesome.redis.server:6380'
});

client.on('ready', async() => {
  await client.setProvider(provider);
});
```

> Keep in mind that Redis was originally meant to be a cache, data is deleted by default across
> service restarts. You can achieve persistence by [properly configuring](https://redis.io/topics/persistence) your
> Redis instance.

### Localizing Your Bot

The package contains a [Localizer](https://docs.greencoaststudios.com/discord.js-extended/master/classes/discord_js_extended.localizer.html) class to help with the localization of your bot. In order to use it, you should pass a `localizer` object to your `client` constructor and
initialize the localizer in the `ready` event.

```js
const client = new ExtendedClient({
  localizer: {
    defaultLocale: 'en', // The default locale for your bot.
    dataProviderKey: 'locale', // The key to be used to store the locale for each guild in the client's data provider.
    localeStrings: locales
  }
});

client.on('ready', async() => {
  await client.setDataProvider(new DataProvider()); // Should set the data provider before.
  await client.localizer.init(); // Initializes the localizer.  
});
```

The `localeStrings` object should map the name of the locale to another object that maps the message keys with their corresponding message string in its respective language.
In the example above, the variable `locales` could be:

```js
const locales = {
  en: {
    'message.test.hello': 'Hello',
    'message.test.bye': 'Bye',
    'message.test.with_value': 'Hello {name}!'
  },
  es: {
    'message.test.hello': 'Hola',
    'message.test.bye': 'Adios',
    'message.test.with_value': 'Hola {name}!'
  },
  fr: {
    'message.test.hello': 'Bonjour',
    'message.test.bye': 'Au revoir',
    'message.test.with_value': 'Bonjour {name}!'
  }
};
```

Locale messages should follow the [ICU format](https://formatjs.io/docs/intl-messageformat/#common-usage-example).

Inside a command, you may use the localizer in the following manner:

```js
class MyCommand extends SlashCommand {
  async run(interaction) {
    const localizer = this.client.localizer.getLocalizer(interaction.guild);
    
    interaction.reply(localizer.t('message.test.hello'));
    interaction.reply(localizer.t('message.test.with_value', { name: 'your name' }));
  }
}
```

This uses the locale saved for the guild. You can change the locale for the guild as such:

```js
class MyCommand extends SlashCommand {
  async run(interaction) {
    const localizer = this.client.localizer.getLocalizer(interaction.guild);
    
    await localizer.updateLocale('fr');
    interaction.reply(`Updated locale to ${localizer.locale}`);
  }
}
```

If you're outside the context of a guild, you can still use the localizer by using:

```js
client.localizer.t('message.test.with_value', 'es', { name: 'your name' });
```

### Creating Commands

The package contains a [RegularCommand](https://docs.greencoaststudios.com/discord.js-extended/master/classes/discord_js_extended.regularcommand.html) to facilitate the creation of commands. In order to create one, you need to create a class that extends RegularCommand and implements a `run()` method.

```js
const { Permissions } = require('discord.js');
const { RegularCommand } = require('@greencoast/discord.js-extended');

module.exports = class MyCommand extends RegularCommand {
  constructor(client) {
    super(client, {
      name: 'cmd', // The command's name. In this case, users need to write !cmd for the command to work.,
      aliases: ['mycmd', 'alias2'], // The command's aliases. With this, users can write !mycmd and !alias2 for the command to work.
      description: 'My command.', // The command's description.
      group: 'my_group', // The ID of the group that holds this command.
      emoji: ':robot:', // The emoji that represents this command. This is used by the default HelpCommand. Defaults to ':robot:'.
      guildOnly: true, // Whether the command may only be used in a guild. Defaults to false.
      nsfw: false, // Whether the command may only be used in a NSFW channel. Defaults to false.
      ownerOnly: false, // Whether the command may only be used by the owner. Defaults to false.
      userPermissions: Permissions.FLAGS.MANAGE_CHANNELS, // The PermissionResolvable representing the permissions that users require to execute this command. Defaults to null.
      ownerOverride: true, // Whether the owner may execute this command even if they don't have the required permissions. Defaults to true.
    });

    run(message, args) {
      message.reply('Hi!');
    }
  }
}
```

This command should be saved in a folder with the ID of its group. These folders should be contained in a bigger folder. The folder tree should look like this:

```text
.
├── commands
│   ├── my_group
│   |   ├── MyCommand.js
│   |   ├── AnotherCommand.js
│   ├── other_group
│   |   ├── OtherCommand.js
```

Once you have this folder structure, you can register your commands in the client:

```js
client.registry
  .registerGroups([
    ['my_group', 'My Group'],
    ['other_group', 'Other Group']
  ])
  .registerCommandsIn('./commands/folder/location');
```

> If you don't register the groups before-hand, the commands will not be registered.

### Creating Slash Commands

You can also use Slash Commands, the package contains a [SlashCommand](https://docs.greencoaststudios.com/discord.js-extended/master/classes/discord_js_extended.slashcommand.html) to facilitate the creation of slash commands. In order to create one, you need to create a class that extends SlashCommand and implements a `run()` method.

```js
const { Permissions } = require('discord.js');
const { SlashCommand } = require('@greencoast/discord.js-extended');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = class MyCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: 'cmd', // The command's name. In this case, users need to write !cmd for the command to work.,
      aliases: ['mycmd', 'alias2'], // The command's aliases. With this, users can write !mycmd and !alias2 for the command to work.
      description: 'My command.', // The command's description.
      group: 'my_group', // The ID of the group that holds this command.
      emoji: ':robot:', // The emoji that represents this command. This is used by the default HelpCommand. Defaults to ':robot:'.
      guildOnly: true, // Whether the command may only be used in a guild. Defaults to false.
      nsfw: false, // Whether the command may only be used in a NSFW channel. Defaults to false.
      ownerOnly: false, // Whether the command may only be used by the owner. Defaults to false.
      userPermissions: Permissions.FLAGS.MANAGE_CHANNELS, // The PermissionResolvable representing the permissions that users require to execute this command. Defaults to null.
      ownerOverride: true, // Whether the owner may execute this command even if they don't have the required permissions. Defaults to true.
      dataBuilder: new SlashCommandBuilder()
    });

    run(interaction) {
      interaction.reply('Hi!');
    }
  }
}
```

To use slash commands, you need to install the following package to access the `SlashCommandBuilder` class:

```text
npm install @discordjs/builders
```

> Keep in mind that you do not need to use `SlashCommandBuilder.setName()` and `SlashCommandBuilder.setDescription()` as
> these are already set by the command constructor.

### Deploying Slash Commands

Slash commands require a special procedure to deploy them and have them live on Discord.

#### Development

For development, it is recommended to have a testing server for the development of the bot. With this in mind, you should set `testingGuildID` on your
client options and have the following `ready` event handler.

```js
client.on('ready', async() => {
  await client.deployer.deployToTestingGuild();
});
```

This will update the slash commands **ONLY** on your testing server.

#### Production

For production, you should have a command deploy script, that could be run by a CI pipeline on a new version of your bot. The following example
can work as a potential deploy script.

```js
require('dotenv').config();
const path = require('path');
const { ExtendedClient, ConfigProvider } = require('@greencoast/discord.js-extended');

const config = new ConfigProvider({
  env: process.env,
  configPath: path.join(__dirname, './config/settings.json'),
  types: {
    TOKEN: 'string'
  }
});

const client = new ExtendedClient({
  config,
  intents: []
});

client.registry
  .registerDefaults()
  .registerGroups([
    ['util', 'Utility'],
    ['slash', 'Slash Commands']
  ])
  .registerCommandsIn(path.join(__dirname, './commands'));

client.on('ready', async() => {
  try {
    await client.deployer.deployGlobally();
  } catch (error) {
    console.error('Something happened!', error);
    process.exit(1);
  }
});

client.on('commandsDeployed', (commands) => {
  console.log(`Successfully deployed ${commands.length} commands globally!`);
  process.exit(0);
});

client.login(client.config.get('TOKEN'));
```

> Keep in mind that you only need to deploy globally once. Also, this process can take up to an hour to be reflected
> on Discord. **You should not use `client.deployer.deployGlobally()` for development.**

## Testing

You can run the unit tests for this package by:

1. Cloning the repo:

```text
git clone https://github.com/greencoast-studios/discord.js-extended
```

2. Installing the dependencies.

```text
npm install
```

3. Running the tests.

```text
npm test
```

## Bots Using This

Here's a list of some bots that use this library.

* [discord-downtime-notifier](https://github.com/moonstar-x/discord-downtime-notifier)
* [discord-free-games-notifier](https://github.com/moonstar-x/discord-free-games-notifier)
* [discord-music-24-7](https://github.com/moonstar-x/discord-music-24-7)
* [discord-tts-bot](https://github.com/moonstar-x/discord-tts-bot)

## Authors

This library was made by [Greencoast Studios](https://greencoaststudios.com).
