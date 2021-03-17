# EasyDiscordBot

**NOTE! Since I'm the only person that created this package I can't take care of everything so in some cases my code may behave not as expected. Feel free to contribute to this project by submitting a change or a bug.**

## Installation
Install this package using:

`npm i ezdiscordbot`

Then import it to your project:

`import EasyDiscordBot from 'ezdiscordbot';`

## Getting started
Create your bot's instance:

`const bot = new EasyDiscordBot(params);`

params - an object that contains bot's basic configuration
- name - string - your bot's name (will appear in help message)
- prefix - string - your bot's prefix ("!" if not specified)
- discordToken - string - discord bot token

Connect your app to Discord using:

`bot.start(port);`

- port - string (optional) - if specified, the app will create an http server and start listening on specified port

## Commands
**The package contains predefined help command.**

You can add your own commands by using:

`bot.addCommand(name, description, permissions, callFunction);`

- name - string - command name (It's being used to start the command)
- description - string - command description that will appear in the help message
- permissions - object - command usage permissions
- callFunction - function - being called when using a command (first argument is a message object)

### Permissions
- admin - boolean - determines if the caller has to be a server administrator
- roles - array (string) - contains IDs of roles that are permitted to use the command
- users - array (string)  - contains IDs of users that are permitted to use the command
**NOTE! The caller has to meet at least 1 requirement to start a command.**

## Events
There are 4 main events:
- onReady - function - will be called each time your bot successfully connects to Discord
- onMessage - function - will be called when someone sends a message
- onCommand - function - will be called when someone starts a bot command
- onError - function - will be called when Discord API returns an error

These 4 functions are located in the "events" property. You can easily overwrite them. Example:

`bot.events.onReady = () => console.log('Bot is ready!')`

## Advanced configuration
Configuration parameters are stored in the "config" property.

- discordToken - string - your bot's token
- prefix - string - bot's prefix
- botMessageDeleteTimeout - number - time (in ms) after which bot's error messages will be deleted
- accentColor - string (HEX or RGB) - used to set color of embed messages
- responses - object:
    **`[command]` will be replaced with the command's name**
    - commandNotFound - string - is being sent when somebody tries to call the command that does not exist
    - insufficientPermissions - string - is being sent when the caller does not have required permissions
- helpMessage - object:
    **`[name]` will be replaced with bot's name**
    - header - string - Help message header
    - description - string - Help message bottom text