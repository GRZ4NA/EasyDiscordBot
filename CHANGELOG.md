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
- new package version system (beta versions)
## 1.4.0-beta2
- "show" command
    + can now display if user is a server owner
    + small changes to the layout
    + fixed category channels permission overwrites
## 1.4.0
- "show" command
    + minor visual tweaks
- 1 minor fix
## 1.4.1
- stability improvement - your bot won't crash if a command function throws an error. It will display an error message to the user instead.
## 1.4.2
- change from 1.4.1 now works with asynchronous functions as well (I forgot to add "await" in one place :D)
## 1.5.0
### beta1
- added command aliases
    + add aliases by inserting an array into the first argument of the addCommand method (first element of the array is your command's name)
    + aliases will display in the help message
    + getCommand and addCommand methods have been reworked to handle this new feature properly (the usage is still the same and they are backwards compatible)
- command permissions and keywords in "help" message are now being shown in separated lines (1 per line)
- few tweaks and code cleanups
### beta2
- fixed a bug that made the prefix stack up and make aliases unusable + caused "help" command to display incorrectly
- changed the appearance of "command does not exist" message in "help" command to an error style
- "help" command can now remove prefix if it was passed with an argument (for example: `!help !show` is going to act as intended now)
### beta3
- "show" command can now display informations about servers (guilds)
    + call it by using `show [your server ID]`
    + you can only view informations about your own server (for security reasons)
### FINAL
- some minor tweaks
## 2.0.0

This version is not compatible with features marked as deprecated in earlier versions.

### beta1
- string processor is now separated from the class (you can import it using `import { stringProcessor } from 'ezdiscordbot'`)
- string processor is now included in `Message.reply()` and `Message.channel.send()` methods (it will replace square bracket expressions automatically)
### beta2
- new command structure
    + new "commands" property
    + commandsList is being replaced with commands.list
    + addCommand() is being replaced with commands.add() (new usage)
    + getCommand() is being replaced with commands.get()
    + old methods are still present and they can be used without any modifications (backwards compatible)
    + more details in documentation
### FINAL
- minor tweaks