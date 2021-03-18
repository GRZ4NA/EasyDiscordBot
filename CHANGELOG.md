# Changelog

## 1.0.5
- removed "version" conecpt (properties, command etc.)
- updated documentation (README.md)
- added `[name]` variable in helpMessage config that will be replaced with your bot's name
- messages will no longer be logged to console by default
- removed userNotConnected message from responses because it wasn't being used by anything
- added a lot of minor tweaks and improvements
## 1.1.0
- added getGuild, getUser, getRole, getChannel methods to easily fetch objects from discord.js
- updated documentation
- added new built-in command which shows details about specified command (name, description, permissions)
- added new botError built-in response to configuration
- updated command processor
- updated onError event (now it can be called with a message argument)
- improved stability
- code cleanups and minor changes