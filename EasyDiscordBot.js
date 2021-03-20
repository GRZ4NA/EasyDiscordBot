import { Client, Guild, MessageEmbed } from "discord.js";
import { DiscordBotCommand } from './src/DiscordBotCommand.js';
import { createCommandHelp, createHelpCommandsList } from './src/generators/helpMessage.js';
import http from 'http';

class EasyDiscordBot {
    constructor(params) {
        try {
            this.client = new Client();
            this.name = params.name.toString();
            this.config = {
                discordToken: params.discordToken ? params.discordToken.toString() : undefined,
                prefix: params.prefix ? params.prefix.toString() : "!",
                botMessageDeleteTimeout: 5000,
                accentColor: "#000",
                botActivity: {
                    title: `[prefix]help`,
                    type: 'WATCHING',
                    url: ''
                },
                responses: {
                    commandNotFound: 'The command "[command]" does not exist.',
                    insufficientPermissions: `You don't have the required permissions to use the "[command]" command.`,
                    botError: `An error occurred when executing command "[command]".`
                },
                helpMessage: {
                    header: `Help for [botName]`,
                    description: `List of available commands`
                }
            };
            this.commandsList = [
                new DiscordBotCommand({
                    name: 'help',
                    description: "Displays list of available commands or detailed informations about specified command",
                    permissions: 0,
                    usage: '[command name (optional)]',
                    execute: async m => {
                        try {
                            if(m.command.arguments[0]) {
                                const command = this.getCommand(m.command.arguments[0]);
                                if(command) {
                                    const fields = await createCommandHelp(this, command, m);
                                    const message = EasyDiscordBot.createEmbed({
                                        title: command.name,
                                        description: this.stringProcessor(command.description),
                                        color: this.config.accentColor,
                                        footer: this.name,
                                        showTimestamp: true,
                                        fields: fields
                                    });
                                    await m.channel.send(message);
                                }
                                else {
                                    m.reply(this.stringProcessor(`The command "[command]" does not exist.`, {command:{isCommand: true, name: m.command.arguments[0]}})).then(m => m.delete({timeout: this.config.botMessageDeleteTimeout ? this.config.botMessageDeleteTimeout : 5000}));
                                }
                            }
                            else {
                                const commands = createHelpCommandsList(this);
                                const message = EasyDiscordBot.createEmbed({
                                    title: this.stringProcessor(this.config.helpMessage.header),
                                    color: this.config.accentColor,
                                    description: this.stringProcessor(this.config.helpMessage.description),
                                    footer: this.name,
                                    fields: commands
                                });
                                await m.channel.send(message);
                            }
                        }
                        catch (e) {
                            this.events.onError(e, m);
                            return;
                        }
                    }
                })
            ];
            this.events = {
                onReady: () => {
                    console.log('Bot is ready!');
                    return;
                },
                onMessage: message => {
                    return;
                },
                onCommand: command => {
                    return;
                },
                onError: (error, message) => {
                    if(message) {
                        message.reply(this.stringProcessor(this.config.responses.botError, message) + ' ' + error.toString()).then(m => m.delete({timeout: this.config.botMessageDeleteTimeout}));
                    }
                    console.error(error);
                    return;
                }
            };
        }
        catch (e) {
            console.error(e);
            return undefined;
        }
    }
    async start(port) {
        console.log(this.stringProcessor(`Bot name: [botName]`));
        console.log(this.stringProcessor(`Bot prefix: [prefix]`));
        console.log(' ');
        try {
            if(!this.config.discordToken) {
                throw new Error('The Discord bot token is not specified. Please include your token in the constructor or add it by using the discordToken configuration property.');
            }
            if(port) {
                console.log('Creating http server...');
                this.config.port = port;
                http.createServer().listen(this.config.port);
                console.log(`Listening on port ${this.config.port}`);
            }
            console.log('Connecting to Discord...');
            this.client.on('ready', () => {
                this.events.onReady();
                return true;
            });
            this.client.on('error', e => this.events.onError(e));
            this.client.on('message', async message => {
                message.command = {};
                if(message.content.startsWith(this.config.prefix) && !message.content.replace(this.config.prefix, '').startsWith(this.config.prefix)) {
                    message.command.isCommand = true;
                    message.command.name = message.content.replace(this.config.prefix, '').split(' ')[0];
                    message.command.arguments = message.content.replace(this.config.prefix, '').replace(message.command.name, '').split(',');
                    for(let i = 0; i < message.command.arguments.length; i++) {
                        message.command.arguments[i] = message.command.arguments[i].replace(' ', '');
                    }
                }
                else {
                    for(let i = 0; i < this.commandsList.length; i++) {
                        if(this.commandsList[i].keywords) {
                            const commandIndex = this.commandsList[i].keywords.findIndex(kw => kw == message.content.split(' ')[0]);
                            if(commandIndex !== -1) {
                                message.command.isCommand = true;
                                message.command.name = this.commandsList[i].name;
                                message.command.arguments = message.content.replace(message.content.split(' ')[0], '').split(',');
                                for(let j = 0; j < message.command.arguments.length; j++) {
                                    message.command.arguments[j] = message.command.arguments[j].replace(' ', '');
                                }
                            }
                        }
                    }
                    if(!message.command.isCommand) { message.command.isCommand = false; }
                }
                if(message.command.isCommand && !message.author.bot) {
                    this.events.onCommand(message);
                    const command = this.getCommand(message.command.name);
                    if(command) {
                        if(await this.permissionsProxy(message, command)) {
                            command.execute(message);
                        }
                        else {
                            message.reply(this.stringProcessor(this.config.responses.insufficientPermissions, message)).then(m => { if(this.config.botMessageDeleteTimeout) { m.delete({ timeout: this.config.botMessageDeleteTimeout }) } });
                        }
                    }
                    else {
                        message.reply(this.stringProcessor(this.config.responses.commandNotFound, message)).then(m => { if(this.config.botMessageDeleteTimeout) { m.delete({ timeout: this.config.botMessageDeleteTimeout }) } });
                    }
                }
                else {
                    this.events.onMessage(message);
                }
            });
            await this.client.login(this.config.discordToken);
            if(this.config.botActivity && typeof this.config.botActivity == 'object') {
                await this.client.user.setActivity(this.stringProcessor(this.config.botActivity.title.toString()), { type: this.config.botActivity.type ? this.config.botActivity.type.toString().toUpperCase() : 'PLAYING', url: this.config.botActivity.url ? this.config.botActivity.url.toString() : undefined });
            }
        }
        catch(e) {
            this.events.onError(e);
            return;
        }
    }
    addCommand(name, description, permissions, callFunction, keywords, usage) {
        try {
            const commandObject = new DiscordBotCommand({
                name: name,
                description: description,
                permissions: permissions,
                keywords: keywords,
                usage: usage,
                execute: callFunction
            });
            if(this.getCommand(name)) {
                throw new ReferenceError(`The command ${name} already exists in this instance.`);
            }
            this.commandsList.push(commandObject);
            return commandObject;   
        }
        catch (e) {
            this.events.onError(e);
            return undefined;
        }
    }
    getCommand(name) {
        try {
            const command = this.commandsList.find(c => c.name == name);
            if(command) {
                return command;
            }
            else {
                throw new ReferenceError(`Command ${name} does not exist in this instance.`);
            }
        }
        catch (e) {
            return undefined;
        }
    }
    async getGuild(id) {
        try {
            const guild = await this.client.guilds.fetch(id);
            if(guild) {
                return guild;
            }
            else {
                throw new ReferenceError(`Cannot find a guild with ID ${id}`);
            }
        }
        catch (e) {
            return undefined;
        }
    }
    async getRole(guild, id) {
        try {
            if(guild instanceof Guild) {
                const role = await guild.roles.fetch(id);
                if(role) {
                    return role;
                }
                else {
                    throw new ReferenceError(`Cannot find a role with ID ${id} in ${guild.name}`);
                }
            }
            else {
                throw new TypeError('First parameter has to be an instance of the Guild class. Get it using the getGuild(id) method.');
            }
        }
        catch (e) {
            return undefined;
        }
    }
    getChannel(guild, id) {
        try {
            if(guild instanceof Guild) {
                const channel = guild.channels.cache.get(id);
                if(channel) {
                    return channel;
                }
                else {
                    throw new ReferenceError(`Cannot find a channel with ID ${id} in ${guild.name}`)
                }
            }
            else {
                throw new TypeError('First parameter has to be an instance of the Guild class. Get it using the getGuild(id) method.');
            }
        }
        catch (e) {
            return undefined;
        }
    }
    async getUser(guild, id) {
        try {
            if(guild instanceof Guild) {
                const user = await guild.members.fetch(id);
                if(user) {
                    return user;
                }
                else {
                    throw new ReferenceError(`Cannot find a user with ID ${id} in ${guild.name}`)
                }
            }
            else {
                throw new TypeError('First parameter has to be an instance of the Guild class. Get it using the getGuild(id) method.');
            }
        }
        catch (e) {
            return undefined;
        }
    }
    async permissionsProxy(message, command) {
        try {
            if(command.permissions) {
                if(command.permissions.users && command.permissions.users instanceof Array) {
                    if(command.permissions.users.findIndex(u => u == message.author.id) !== -1) {
                        return true;
                    }
                }
                if(command.permissions.roles && command.permissions.roles instanceof Array) {
                    let userRoles = message.member.roles.cache;
                    userRoles = userRoles.array();
                    for(let i = 0; i < userRoles.length; i++) {
                        if(command.permissions.roles.findIndex(r => r == userRoles[i]) !== -1) {
                            return true;
                        }
                    }
                }
                if(command.permissions.permissions && command.permissions.permissions instanceof Array) {
                    const permissionList = command.permissions.permissions;
                    const userPermissions = message.member.permissions.toArray();
                    for(let i = 0; i < userPermissions.length; i++) {
                        if(permissionList.findIndex(p => p.toUpperCase() == userPermissions[i]) !== -1) {
                            return true;
                        }
                    }
                }
                return false;
            }
            else {
                return true;
            }
        }
        catch (e) {
            console.error(e);
            return false;
        }
    }
    stringProcessor(string, message) {
        string = string.split('[botName]').join(this.name);
        string = string.split('[prefix]').join(this.config.prefix);
        string = string.split('[command]').join(message && message.command && message.command.isCommand ? message.command.name : "");
        return string;
    }
    static createEmbed(params) {
        try {
            const message = new MessageEmbed();
            message.setColor(params.color ? params.color.toString() : "#000");
            if(params.title) { message.setTitle(params.title.toString()); }
            if(params.url) { message.setURL(params.url.toString()); }
            if(params.author && params.author instanceof Array) { message.setAuthor(params.author[0], params.author[1], params.author[2]); }
            if(params.description) { message.setDescription(params.description.toString()); }
            if(params.thumbnail) { message.setThumbnail(params.thumbnail); }
            if(params.showTimestamp === true) { message.setTimestamp(); }
            if(params.image) { message.setImage(params.image.toString()); }
            if(params.footer) { message.setFooter(params.footer.toString()); }
            if(params.fields && params.fields instanceof Array) {
                for(let i = 0; i < params.fields.length; i++) {
                    message.addField(params.fields[i].title, params.fields[i].value, params.fields[i].inline === true);
                }
            }
            return message;
        }
        catch (e) {
            console.error(e);
            return;
        }
    }
}

export default EasyDiscordBot;
export { EasyDiscordBot };