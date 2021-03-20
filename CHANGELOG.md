# Changelog

## 1.0.5
- removed "version" conecpt (properties, command etc.)
- added documentation
- added `[name]` variable in helpMessage config that will be replaced with your bot's name
- messages will no longer be logged to console by default
- removed userNotConnected message from responses because it wasn't being used by anything
- added a lot of minor tweaks and improvements
## 1.1.0
- added getGuild, getUser, getRole, getChannel methods to easily fetch objects from discord.js
- added new built-in command which shows details about specified command (name, description, permissions)
- added new botError built-in response to configuration
- updated command processor
- updated onError event (now it can be called with a message argument)
- improved stability
- code cleanups and minor changes
## 1.2.0
- every command is now an instance of the new `DiscordBotCommand` class (backwards compatible)
- added ability to add keywords to a command that can trigger the command without prefix (details in documentation)
- merged `help` and `command` commands to `help` (to display detailed informations about command type `[prefix]help [command name]`)
- **getGuild, getRole, getUser methods are now asynchronous**
- updated permission system
+ added "permissions" property which is an array of permissions that can activate the command ([list](https://discord.js.org/#/docs/main/stable/class/Permissions?scrollTo=s-FLAGS))
- added string processor function that replaces names in square brackets (details in documentation) **DO NOT OVERWRITE THIS FUNCTION**
- added botActivity property to bot's configuration that can set bot's activity status (details in documentation)