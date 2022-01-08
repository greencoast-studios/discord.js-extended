[![ci-build-status](https://img.shields.io/github/workflow/status/greencoast-studios/discord.js-extended/CI?logo=github)](https://github.com/greencoast-studios/discord.js-extended)
[![issues](https://img.shields.io/github/issues/greencoast-studios/discord.js-extended?logo=github)](https://github.com/greencoast-studios/discord.js-extended)
[![bundle-size](https://img.shields.io/bundlephobia/min/@greencoast/discord.js-extended)](https://www.npmjs.com/package/@greencoast/discord.js-extended)
[![version](https://img.shields.io/npm/v/@greencoast/discord.js-extended?logo=npm)](https://www.npmjs.com/package/@greencoast/discord.js-extended)
[![djs-version](https://img.shields.io/npm/dependency-version/@greencoast/discord.js-extended/peer/discord.js?logo=npm)](https://www.npmjs.com/package/@greencoast/discord.js-extended)
[![downloads-week](https://img.shields.io/npm/dw/@greencoast/discord.js-extended?logo=npm)](https://www.npmjs.com/package/@greencoast/discord.js-extended)
[![downloads-total](https://img.shields.io/npm/dt/@greencoast/discord.js-extended?logo=npm)](https://www.npmjs.com/package/@greencoast/discord.js-extended)

# Discord.js - Extended

[discord.js-extended](https://github.com/greencoast-studios/discord.js-extended) is a library that facilitates the repetitive tasks when creating Discord bots with [Discord.js](https://discord.js.org/#/). Used by [Greencoast Studios](https://greencoaststudios.com).

Heavily inspired by [discord.js-commando](https://www.npmjs.com/package/discord.js-commando), it includes similar design decisions, however this adds certain functionality that isn't available like a configuration provider and automatic presence management. This package does not include all functionality provided by Commando, in fact, Commando is way more powerful than this library. Nevertheless, this was built to make it easier for us to quickly build bots without having to repeat ourselves that much.

This was made for [Discord.js](https://discord.js.org/#/) v13.5, however any v12 should work fine.

## Usage

You can visit the [documentation site](https://docs.greencoaststudios.com/discord.js-extended) to see what this library offers.

### Installation

This package does not install [Discord.js](https://discord.js.org/#/), so you should install it yourself.

You can install this package with:

```text
npm install discord.js @greencoast/discord.js-extended
```

## Configuring your Client

This package covers client configuration from environment variables and/or JSON files through the [ConfigProvider](https://docs.greencoaststudios.com/discord.js-extended/classes/discord_js_extended.configprovider.html) class, which makes it easy to add configuration to a bot. Consider checking the [documentation page](https://docs.greencoaststudios.com/discord.js-extended/classes/discord_js_extended.configprovider.html) to see how to use this.

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
    OPTIONAL_FLAG: false
  },
  types: { // These are the types of the configuration. The provider validates that the config receives the proper configuration types.
    PREFIX: 'string',
    TOKEN: ['string', 'null'], // With a 'null' type, you can pass 'null' to have it as null.
    MY_ID: 'number',
    OPTIONAL_FLAG: ['boolean', 'null']
  }
});

const client = new ExtendedClient({
  config,
  intents: [Intents.FLAGS.GUILDS]
});
```

Make sure to check the [documentation page](https://docs.greencoaststudios.com/discord.js-extended/classes/discord_js_extended.configprovider.html) to see the structure of the JSON file required and the type of environment variables that are supported.

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
    templates: ['presence 1', 'presence 2'], // The presence statuses used by this bot.
    refreshInterval: 3600000 // Update the bot's presence every hour.
  },
  errorOwnerReporting: true, // Sends DMs to the bot's owner whenever a command throws an error.
  intents: [Intents.FLAGS.GUILDS]
});

client.login(<YOUR_DISCORD_TOKEN_HERE>);
```

The `presence` option in the client's constructor allows you to configure the presence statuses to be used by the bots. These presence statuses may include information from the bot, such as: number of guilds connected to, number of commands, the time the bot went online, among others... Consider checking the [documentation page](https://docs.greencoaststudios.com/discord.js-extended/classes/discord_js_extended.presencetemplater.html) to see what information you can include in your presence statuses.

### Adding defaults to your Client

You can register default handlers for the [Discord.js Client](https://docs.greencoaststudios.com/discord.js-extended/classes/discord_js_extended.clientdefaulthandlers.html) events, as well as the [ExtendedClient](https://docs.greencoaststudios.com/discord.js-extended/classes/discord_js_extended.extraclientdefaulthandlers.html) custom events.

```js
client.registerDefaultEvents().registerExtraDefaultEvents();
```

The package also comes with default commands that you can use on your bot. Check the [Default Commands](https://docs.greencoaststudios.com/discord.js-extended/modules/defaultcommands.html) to see the available commands you can register right away. You can register them like:

```js
client.registry.registerDefaults();
```

### Adding a Database Provider to your Client

The package comes with persistent data functionality that can be enabled. The [DataProvider](https://docs.greencoaststudios.com/discord.js-extended/classes/discord_js_extended.dataprovider.html) is an abstract class that serves as common interface to use. By default, data is stored by guild, but you can also store/get data on a global scope.

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

[LevelDataProvider](https://docs.greencoaststudios.com/discord.js-extended/classes/dataproviders.leveldataprovider.html) is a data provider implemented with a [LevelDB](https://www.npmjs.com/package/level) backend. In order to use this, you need to install [level](https://www.npmjs.com/package/level).

```text
npm install level
```

In order to set up this data provider, you need to import it and add it to your client.

```js
const LevelDataProvider = require('@greencoast/discord.js-extended/dist/providers/LevelDataProvider').default;

const provider = new LevelDataProvider(client, 'database_location');

client.on('ready', () => {
  client.setProvider(provider);
});
```

### Creating Commands

The package contains a [Command](https://docs.greencoaststudios.com/discord.js-extended/classes/discord_js_extended.command.html) to facilitate the creation of commands. In order to create one, you need to create a class that extends Command and implements a `run()` method.

```js
const { Permissions } = require('discord.js');
const { Command } = require('@greencoast/discord.js-extended');

module.exports = class MyCommand extends Command {
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

## Authors

This library was made by [Greencoast Studios](https://greencoaststudios.com).
