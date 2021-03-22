# EasyDiscordBot
Version 1.2.2

*Documentation might change without patching the package on npmjs. Please read [README.md](https://github.com/GRZ4NA/EasyDiscordBot/blob/master/README.md) on the GitHub repo to get the latest documentation.*
**NOTE! Since I'm the only person that created this package I can't take care of everything so in some cases my code may behave not as expected. Feel free to contribute to this project by submitting a change or a bug.**

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
1. Install the package:
```
npm i ezdiscordbot
```
2. Import it to your project:
```
import { EasyDiscordBot } from 'ezdiscordbot';
```
3. Insert the following line in your package.json file:
```
"type": "module"
```

## Getting started
Create your bot's instance:
```
const bot = new EasyDiscordBot(params);
```

params - an object that contains bot's basic configuration
- name - string - your bot's name (will appear in help message)
- prefix - string - your bot's prefix ("!" if not specified)
- discordToken - string - Discord bot token

Connect your app to Discord using:
```
bot.start(port);
```

- port - string (optional) - if specified, the app will create an http server and start listening on specified port

## Commands
The package contains 1 built-in command:
- `help [command name (optional)]` - shows commands list or details about `[command name]`

You can add your own commands by using:
```
bot.addCommand(name, description, permissions, callFunction, keywords, usage, hidden);
```

- name - string - command name (It's being used to start the command)
- description - string - command description that will appear in the help message
- permissions - object or null - command usage permissions
- callFunction - function - being called when using a command (first argument is a message object)
- keywords - array (string) - array of keywords that can trigger the commnand without prefix
- usage - string - usage instructions that will be displayed in help message
- hidden - boolean - if it's `true`, the command will not appear in the help message

### Command arguments
Command arguments are located in the "command" property of every "message" object.
- isCommand - boolean - is true when the message is an instance of a command
- name - string - name of the command
- arguments - array (string) - arguments list

### Permissions
- permissions - array (string) - contains names of privileges that are permitted to use the command (list of permissions available [here](https://discord.js.org/#/docs/main/stable/class/Permissions?scrollTo=s-FLAGS))
- roles - array (string) - contains IDs of roles that are permitted to use the command
- users - array (string)  - contains IDs of users that are permitted to use the command
**NOTE! The caller has to meet at least 1 requirement to start a command.**

### Text processing
This class has stringProcessor function built-in (**do not overwrite it**)
It's being called every time your bot sends a message but you have to manually include it in your own commands.
```
bot.stringProcessor(string, message);
```

- string - string - a string that will be processed
- message - object (Message) - a Message instance that will be used to replace `[command]`

Variables (in square brackets) that can be replaced:
- `[botName]` - replaced with your bot's name
- `[prefix]` - replaced with bot's prefix
- `[command]` - replaced with command's name (if message argument is present)

## Events
There are 4 main events:
- onReady - function - will be called each time your bot successfully connects to Discord
- onMessage - function - will be called when someone sends a message
    + message - object - a message object
- onCommand - function - will be called when someone starts a bot command
    + message - object - a message object
- onError - function - will be called when Discord API returns an error
    + error - object - an error object
    + message - object (optional) - a message object that will be used to reply to the caller with error message

These 4 functions are located in the "events" property. You can easily overwrite them. Example:
```
bot.events.onReady = () => console.log('Bot is ready!')
```

## Advanced configuration
Configuration parameters are stored in the "config" property.

- discordToken - string - your bot's token
- prefix - string - bot's prefix
- botMessageDeleteTimeout - number - time (in ms) after which bot's error messages will be deleted
- accentColor - string (HEX or RGB) - used to set color of embed messages
- responses - object:
    + commandNotFound - string - is being sent when somebody tries to call the command that does not exist
    + insufficientPermissions - string - is being sent when the caller does not have required permissions
    + botError - string - is being sent when error occurs
- helpMessage - object:
    + header - string - Help message header
    + description - string - Help message bottom text
    + hidden - boolean - if it's `true`, the help command will not appear in the help message
- botActivity - object - an object that can will be used to set your bot's activity on Discord:
    + type - string - type of activity ([list](https://discord.js.org/#/docs/main/stable/typedef/ActivityType))
    + url - string (optional)
    + title - string - activity name

## Embed messages
A static property is defined for creating embed content.
```
EasyDiscordBot.createEmbed(params);
```

params - object:
- title - string - title of embed message
- description - string - bottom text of embed message
- footer - string
- showTimestamp - boolean
- color - color of the embed content
- image - string (url) - URL to an image that will be attached to the message
- thumbnail - string (url) - URL to an image that will be attached to the message as a thumbnail
- author - array (string):
    + name - string
    + image - string (url)
    + link - string (url) - link to external resource that will be attached to the author
- url - string (url) - URL that will be attached to the message
- fields - array (object):
    + title - string - title of the field
    + value - string - bottom text of the field
    + inline - boolean - determines if the field is displayed in line

## Fetching objects
- Get guild by ID - getGuild(id) - returns Promise(Guild or `undefined`)
    + id - string - id of a guild
- Get role by ID - getRole(id) - returns Promise(Role or `undefined`)
    + id - string - role ID
- Get channel by ID - getChannel(id) - returns Channel, VoiceChannel, TextChannel, CategoryChannel or `undefined`
    + id - string - channel ID
- Get user by ID - getUser(id) - return Promise(Member or `undefined`)
    + id - string - user ID
- Get command by name - getCommand(name) - returns command object from commands list or `undefined`
    + name - string - command name
