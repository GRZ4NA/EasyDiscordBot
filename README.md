# EasyDiscordBot

## Installation
You can install this module using npm:

`npm i ezdiscordbot`

Import it to your project using:

`import EasyDiscordBot from 'ezdiscordbot';`

## Getting started
Initialize your bot by creating a new constnat variable:

`const bot = new EasyDiscordBot(params);`

params - an object that contains bot's basic config
- name - string - your bot's name (it will be used to indentify your bot)
- version - string (optional) - if you plan to update your bot over time you can assign it a version that will be used to identify your bot
- prefix - string - prefix that will be used to call your bot (default: !)
- discordToken - string - your discord bot token that will be used to connect your app to the bot
Start your bot using:

`bot.login(port);`

port - string (optional) - (if specified) the app will create an http server that will be using the specified port

## Commands
There are 2 predefined commands:
- help - displays list of commands
- version - (if version specified) displays your bot's name and version
You can add your own command using:

`bot.addCommand(name, description, permissions, callFunction);`

- name - string - command name, that will be used to call the command
- description - string - command's description that will be displayed in help message
- permissions - object - specifies who can use the command
- callFunction - function - function that will be called when using a command (first argument is a message object)

### Permissions
- admin - boolean - determines if the caller has to be a server administrator
- roles - array (string) - array that contains roles' IDs that are permitted to use the command
- users - array (string)  - array that contains users' IDs that are permitted to use the command
**NOTE! User is permitted to use the command when it meets at least 1 requirement.**