# EasyDiscordBot
2.0.0-beta2

[Changelog](https://github.com/GRZ4NA/EasyDiscordBot/blob/master/CHANGELOG.md#200-beta2)

This version may contain some bugs since it hasn't been fully tested yet. Documentation for the latest stable release can be found [here](https://github.com/GRZ4NA/EasyDiscordBot/blob/15047369944340b19aa7255236c77dca4acd2ada/README.md). If you find a bug, typo etc, report it to me using the Issues tab on GitHub or make your own pull request.

*Documentation might change without patching the package on npmjs. Please read [README.md](https://github.com/GRZ4NA/EasyDiscordBot/blob/master/README.md) on the GitHub repo to get the latest documentation.*

**Since I'm the only person that created this package I can't take care of everything so in some cases my code may behave not as expected. Feel free to contribute to this project by submitting a change or a bug.**

## Table of contents
- [Installation](#installation)
- [Getting started](#getting-started)
- [Commands](#commands)
    + [Command arguments](#command-arguments)
    + [Permissions](#permissions)
    + [Text processing](#text-processing)
- [Events](#events)
- [Advanced configuration](#advanced-configuration)
- [Embed messages](#embed-messages)
- [Fetching objects](#fetching-objects)

## Installation
1. Install the package
```
npm i ezdiscordbot
```
2. Import it to your project
```
import { EasyDiscordBot } from 'ezdiscordbot';
```
Additional modules that you can import from the package
- stringProcessor - function - use it to replace square brackets expressions
- DiscordBotCommand - class - another way to create commands (not recommended) (you have to push them to the `commandsList` manually)

3. Insert the following line into your package.json file
```
"type": "module"
```

## Getting started
Create your bot's instance
```
const bot = new EasyDiscordBot(params);
```
Arguments
- params - an object that contains bot's basic configuration
    + name - string - your bot's name (will appear in help message)
    + prefix - string - your bot's prefix ("!" if not specified)
    + discordToken - string - Discord bot token ([Discord Developer Portal](https://discord.com/developers/applications))
Connect your app to Discord using
```
bot.start(port);
```
Arguments
- port - string (optional) - if specified, the app will create an http server and start listening on specified port

## Commands
The package contains 2 built-in commands
- `help [command name (optional)]` - shows commands list or details about `[command name]`
- `show [role/user/channel/server ID/ping]` - shows details about given object (hidden by default) (requires ADMINISTRATOR privileges)
```
bot.config.helpMessage = null;      # disable "help" command
bot.config.showCommand.enabled = false;     # disable "show" command
bot.config.showCommand.hidden = false       # show the "show" command in the help message;
bot.config.helpMessage.hidden = true        # hide the "help" command;
```
You can add your own commands by using
```
bot.commands.add(options)
```
Options
- name
    + string - your command name that will be used to trigger the command
    + array (string)
        * first element is the command name
        * other elements are aliases that can also be used to trigger the command
- description - string - command description that will appear in the help message
- permissions - object or null - command usage permissions
- execute - function - being called when using a command (first argument is a message object)
- keywords - array (string) - array of keywords that can trigger the commnand without prefix
- usage - string - usage instructions that will be displayed in help message
- hidden - boolean - if it's `true`, the command will not appear in the help message

You can get a full list of commands in the instance from commands.list property
```
console.log(bot.commands.list); // Logs array of Command instances to console
```

To get a specified Command instance use commands.get(name)
- name - string - command name
```
bot.commands.get('help').description = 'Help message'; // Changes description of the "help" command
```

### Command arguments
Command arguments are located in the "command" property of every "message" object.
- isCommand - boolean - is true when the message is an instance of a command
- name - string - name of the command
- arguments - array (string) - arguments list

### Permissions
- permissions - array (string) - contains names of privileges that are permitted to use the command (list of permissions available [here](https://discord.js.org/#/docs/main/stable/class/Permissions?scrollTo=s-FLAGS))
- roles - array (string) - contains IDs of roles that are permitted to use the command
- users - array (string)  - contains IDs of users that are permitted to use the command

**The caller has to meet at least 1 requirement to start a command.**

### Text processing
The following expressions will be replaced while sending a message, replying or using stringProcessor function in any other place
- `[botName]` - replaced with your bot's name
- `[prefix]` - replaced with bot's prefix
- `[command]` - replaced with command's name

Using string processor manually
```
import { stringProcessor } from 'ezdiscordbot';
console.log(stringProcessor.bind(this)('[botName]')); // Logs your bot's name from the bot.name property to the console
```
You can also use template strings
```
bot.addCommand('id', 'Displays your ID', 0, m => { m.reply(`Your ID is: ${m.author.id}`) });
```

## Events
There are 4 main events
- onReady - function - will be called each time your bot successfully connects to Discord
- onMessage - function - will be called when someone sends a message
    + message - object - a message object
- onCommand - function - will be called when someone starts a bot command
    + message - object - a message object
- onError - function - will be called when Discord API returns an error
    + error - object - an error object
    + message - object (optional) - a message object that will be used to reply to the caller with error message
These 4 functions are located in the "events" property. You can easily overwrite them.
```
bot.events.onReady = () => console.log('Bot is ready!')
```
You can add other events from the Client instance ([list](https://discord.js.org/#/docs/main/stable/class/Client))
```
bot.client.on('channelCreate', c => {
    console.log('Created channel:', c.name);
});
```

**Using `bot.client.on('message')` instead of `bot.events.onReady` will overwrite the message processor that's built-in to this package. If you do this, your bot will not react to any command.**

## Advanced configuration
Configuration parameters are stored in the "config" property.
- discordToken - string - your bot's token
- prefix - string - bot's prefix
- accentColor - string (HEX or RGB) - used to set color of embed messages
- helpMessage - object
    + header - string - Help message header
    + description - string - Help message bottom text
    + hidden - boolean - if it's `true`, the help command will not appear in the help message
- botActivity - object - an object that will be used to set your bot's activity on Discord
    + type - string - type of activity ([list](https://discord.js.org/#/docs/main/stable/typedef/ActivityType))
    + url - string (optional)
    + title - string - activity name

**To disable these 3 messages, change these properties' type to something, that's not an object**
- errorMessage - object - used to configure the appearance of an error message
    + header - string - title of an error message
    + description - string - bottom text of an error message
    + color - string - color of the embedded content
    + detailsTitle - string - title of details field
    + deleteTimeout - number - time (in ms) after which an error message will be deleted
- insufficientPermissions - object - used to configure the appearance of a permission error message
    + header - string - title of the message
    + description - string - bottom text of the message
    + color - string - color of the embedded content
    + deleteTimeout - number - time (in ms) after which the message will be deleted
- commandNotFound - object - used to configure the appearance of a "command not found" message
    + content - string - message to the user
    + color - string - color of the embedded content
    + deleteTimeout - number - time (in ms) after which the message will be deleted

## Embed messages
A static property is defined for creating embedded content.
```
EasyDiscordBot.createEmbed(params);
```
- params - object
    + title - string - title of embedded message content
    + description - string - bottom text of embedded message content
    + footer - string
    + showTimestamp - boolean
    + color - color of the embedded content
    + image - string (url) - URL to an image that will be attached to the message
    + thumbnail - string (url) - URL to an image that will be attached to the message as a thumbnail
    + author - array (string)
        * name - string
        * image - string (url)
        * link - string (url) - link to external resource that will be attached to the author
    + url - string (url) - URL that will be attached to the message
    + fields - array (object)
        * title - string - title of the field
        * value - string - bottom text of the field
        * inline - boolean - determines if the field is displayed in line

## Fetching objects
- Get guild by ID - getGuild(id) - returns Promise(Guild or `null`)
    + id - string - id of a guild
- Get role by ID - getRole(guild, id) - returns Promise(Role or `null`)
    + guild - string (guild ID) or a Guild instance
    + id - string - role ID
- Get channel by ID - getChannel(guild, id) - returns Promise(Channel, VoiceChannel, TextChannel, CategoryChannel or `null`)
    + guild - string (guild ID) or a Guild instance
    + id - string - channel ID
- Get user by ID - getUser(guild, id) - return Promise(Member or `null`)
    + guild - string (guild ID) or a Guild instance
    + id - string - user ID