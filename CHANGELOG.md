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
## 1.2.1
- added the ability to hide a command from the help message
- the bot has no activity set by default
- added the ability to hide the help command from the help message by editing config.helpMessage.hidden
- some minor tweaks
## 1.2.2
***NOTE! This version has been unpublished from npmjs because of the huge security issue that was discovered after publishing the package. If you're using this version, immediately roll back to version 1.2.1 using: `npm i ezdiscordbot@1.2.1`! The old syntax of getRole, getUser and getChannel methods is not going to be deprecated since it's change created this major vulnerability!***
## 1.3.0
- getChannel method is now asynchronous as well
- added a warning about deprecation of "admin" property in permissions object (it's going to be removed in the future)
- every get function which requires a Guild instance (getChannel, getRole, getUser) can now take a guild ID as the first argument
- all get functions now return `null` instead of `undefined` if nothing matches
- added new "show" command which displays informations about given object from the server (user, channel, role) (by default it's hidden)
- few code cleanups and minor tweaks
## 1.3.0-hotfix2
- "show" command requires administrator privileges (security issue)
## 1.4.0-beta1
- "show" command updates
    + it can now display user's permissions
    + it can now display detailed permissions for the given channel instead of "Private channel: YES"
- new appearance of error, "insufficient permissions" and "command not found" messages
    + embedded content
    + more user friendly appearance
    + configurable (more on that in documentation)
- object structure changes (You can still use these old properties in this version, but that is going to be changed in the future)
    + config.responses.botError has been moved to config.errorMessage.description 
    + config.botMessageDeleteTimeout has been moved to config.errorMessage.deleteTimeout
    + config.responses.insufficientPermissions has been moved to config.insufficientPermissions.description
    + config.responses.commandNotFound has been moved to config.commandNotFound.content
- few minor changes
- new package version system (includes betas and hotfixes)