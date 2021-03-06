import { Client, Guild, MessageEmbed, APIMessage, User, GuildMember } from "discord.js";
import { Command, CommandManager } from './src/commands.js';
import { createCommandHelp, createHelpCommandsList } from './src/generators/helpMessage.js';
import { generateShowCommand } from './src/generators/showCommand.js';
import { stringProcessor } from './src/stringProcessor.js';
import { checkCommandAccess } from './src/permissions.js';
import http from 'http';

class EasyDiscordBot {
    constructor(params) {
        try {
            this.client = new Client();
            this.name = params.name.toString();
            this.config = {
                discordToken: params.discordToken ? params.discordToken.toString() : undefined,
                prefix: params.prefix ? params.prefix.toString() : "!",
                accentColor: "#000",
                botActivity: null,
                helpMessage: {
                    header: `📘 Help for [botName]`,
                    description: `List of available commands`,
                    hidden: false
                },
                showCommand: {
                    enabled: true,
                    hidden: true
                },
                errorMessage: {
                    header: '❌ An error occurred',
                    description: `An error occurred when executing the "[command]" command.`,
                    color: '#ff0000',
                    detailsTitle: 'Details:',
                    deleteTimeout: 5000
                },
                insufficientPermissions: {
                    header: '👮‍♂️ Insufficient permissions',
                    description: `You don't have the required permissions to use the "[command]" command.`,
                    color: '#1d1dc4',
                    deleteTimeout: 5000
                },
                commandNotFound: {
                    content: '🔍 Command "[command]" does not exist',
                    color: '#ff5500',
                    deleteTimeout: 3000
                }
            };
            this.commands = new CommandManager();
            //BACKWARDS COMPATIBILITY
            const backwardsCompatibilityList = () => { return this.commands.list; };
            this.commandsList = backwardsCompatibilityList();
            //END
            this.commands.add(new Command({
                name: 'help',
                description: "Displays list of available commands or detailed informations about specified command",
                permissions: 0,
                usage: '[command name (optional)]',
                hidden: false,
                execute: async m => {
                    if(m.command.arguments[0]) {
                        if(m.command.arguments[0].startsWith(this.config.prefix)) {
                            m.command.arguments[0] = m.command.arguments[0].replace(this.config.prefix, '');
                        }
                        const command = this.commands.get(m.command.arguments[0]);
                        if(command) {
                            const fields = await createCommandHelp(this, command, m);
                            const message = EasyDiscordBot.createEmbed({
                                title: command.name,
                                description: stringProcessor.bind(this)(command.description),
                                color: this.config.accentColor,
                                footer: command.hidden ? "Hidden" : "",
                                showTimestamp: true,
                                fields: fields
                            });
                            await m.channel.send(message);
                        }
                        else {
                            throw new ReferenceError(stringProcessor.bind(this)(`The command "[command]" does not exist.`, {command:{isCommand: true, name: m.command.arguments[0]}}))
                        }
                    }
                    else {
                        const commands = createHelpCommandsList(this);
                        const message = EasyDiscordBot.createEmbed({
                            title: stringProcessor.bind(this)(this.config.helpMessage.header),
                            color: this.config.accentColor,
                            description: stringProcessor.bind(this)(this.config.helpMessage.description),
                            footer: this.name,
                            fields: commands
                        });
                        await m.channel.send(message);
                    }
                }
            }));
            this.commands.add(new Command({
                name: 'show',
                description: 'Displays information about the given user, channel, server or role',
                usage: '[user/role/channel/server ID/ping]',
                permissions: {
                    permissions: 'ADMINISTRATOR'
                },
                hidden: true,
                execute: async m => {
                    if(m.command.arguments[0]) {
                        let messageBody;
                        if(m.command.arguments[0].startsWith('<@!')) {
                            const id = m.command.arguments[0].replace('<@!', '').replace('>', '');
                            const user = await this.getUser(m.guild, id);
                            if(user) {
                                messageBody = await generateShowCommand(user, this);
                            }
                        }
                        else if(m.command.arguments[0].startsWith('<@&')) {
                            const id = m.command.arguments[0].replace('<@&', '').replace('>', '');
                            const role = await this.getRole(m.guild, id);
                            if(role) {
                                messageBody = await generateShowCommand(role, this);
                            }
                        }
                        else if(m.command.arguments[0].startsWith('<#')) {
                            const id = m.command.arguments[0].replace('<#', '').replace('>', '');
                            const textChannel = await this.getChannel(m.guild, id);
                            if(textChannel) {
                                messageBody = await generateShowCommand(textChannel, this);
                            }
                        }
                        else {
                            const id = m.command.arguments[0];
                            const user = await this.getUser(m.guild, id);
                            const guild = await this.getGuild(id);
                            const role = await this.getRole(m.guild, id);
                            const channel = await this.getChannel(m.guild, id);
                            if(user) {
                                messageBody = await generateShowCommand(user, this);
                            }
                            else if(guild && guild.id == m.guild.id) {
                                messageBody = await generateShowCommand(guild, this);
                            }
                            else if(role) {
                                messageBody = await generateShowCommand(role, this);
                            }
                            else if(channel) {
                                messageBody = await generateShowCommand(channel, this);
                            }
                            else {
                                throw new ReferenceError(`The ID "${id}" has not been found in ${m.guild.name}`);
                            }
                        }
                        const message = EasyDiscordBot.createEmbed(messageBody);
                        await m.channel.send(message);
                    }
                    else {
                        throw new ReferenceError('Object "[command]" has not been found in this server');
                    }
                }
            }));
            this.events = {
                onReady: () => {
                    console.log('Bot is ready!');
                    return;
                },
                onMessage: () => {
                    return;
                },
                onCommand: () => {
                    return;
                },
                onError: (error, message) => {
                    if(message) {
                        if(this.config.errorMessage instanceof Object) {
                            const details = EasyDiscordBot.createEmbed({
                                title: stringProcessor.bind(this)(this.config.errorMessage.header ? this.config.errorMessage.header.toString() : "❌ An error occurred"),
                                color: this.config.errorMessage.color ? this.config.errorMessage.color.toString() : '#ff0000',
                                description: stringProcessor.bind(this)(this.config.errorMessage.description ? this.config.errorMessage.description.toString() : message.content.toString(), message),
                                footer: stringProcessor.bind(this)('[botName]'),
                                showTimestamp: true,
                                fields: [
                                    {
                                        title: stringProcessor.bind(this)(this.config.errorMessage.detailsTitle ? this.config.errorMessage.detailsTitle.toString() : "Details:"),
                                        value: error.toString(),
                                        inline: false
                                    }
                                ]
                            });
                            message.channel.send(details).then(m => {
                                m.delete({ timeout: typeof this.config.errorMessage.deleteTimeout == 'number' ? this.config.errorMessage.deleteTimeout : 5000});
                            });
                        }
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
        console.log(stringProcessor.bind(this)(`Bot name: [botName]`));
        console.log(stringProcessor.bind(this)(`Bot prefix: [prefix]`));
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
                message.reply = (content, options) => {
                    content = stringProcessor.bind(this)(content, message);
                    return message.channel.send(
                        content instanceof APIMessage ? content : APIMessage.transformOptions(content, options, { reply: message.member || message.author }),
                    );
                }
                message.channel.send = async (content, options) => {
                    if(message.channel instanceof User || message.channel instanceof GuildMember) {
                        return message.channel.createDM().then(dm => dm.send.bind(this)(stringProcessor.bind(this)(content, message), options));
                    }
                    let apiMessage;
                    if(content instanceof APIMessage) {
                        apiMessage = content.resolveData();
                    } 
                    else {
                        apiMessage = APIMessage.create(message.channel, stringProcessor.bind(this)(content, message), options).resolveData();
                        if(Array.isArray(apiMessage.data.content)) {
                            return Promise.all(apiMessage.split().map(message.channel.send.bind(message.channel)));
                        }
                    }
                    const { data, files } = await apiMessage.resolveFiles();
                    return this.client.api.channels[message.channel.id].messages
                        .post({ data, files })
                        .then(d => message.channel.client.actions.MessageCreate.handle(d).message);
                }
                if(message.content.startsWith(this.config.prefix) && !message.content.replace(this.config.prefix, '').startsWith(this.config.prefix)) {
                    message.command.isCommand = true;
                    message.command.name = message.content.replace(this.config.prefix, '').split(' ')[0];
                    message.command.arguments = message.content.replace(this.config.prefix, '').replace(message.command.name, '').split(',');
                    for(let i = 0; i < message.command.arguments.length; i++) {
                        message.command.arguments[i] = message.command.arguments[i].replace(' ', '');
                    }
                }
                else {
                    for(let i = 0; i < this.commands.list.length; i++) {
                        if(this.commands.list[i].keywords) {
                            const commandIndex = this.commands.list[i].keywords.findIndex(kw => kw == message.content.split(' ')[0]);
                            if(commandIndex !== -1) {
                                message.command.isCommand = true;
                                message.command.name = this.commands.list[i].name;
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
                    const command = this.commands.get(message.command.name);
                    if(command) {
                        if(await checkCommandAccess(message, command)) {
                            try {
                                await command.execute(message);   
                            } catch (e) {
                                this.events.onError(e, message);
                            }
                        }
                        else {
                            if(this.config.insufficientPermissions instanceof Object) {
                                message.channel.send(EasyDiscordBot.createEmbed({
                                    title: stringProcessor.bind(this)(this.config.insufficientPermissions.header ? this.config.insufficientPermissions.header.toString() : "👮‍♂️ Insufficient permissions"),
                                    color: this.config.insufficientPermissions.color ? this.config.insufficientPermissions.color : "#1d1dc4",
                                    description: stringProcessor.bind(this)(this.config.insufficientPermissions.description ? this.config.insufficientPermissions.description.toString() : `You don't have the required permissions to use the "[command]" command.`, message),
                                    footer: stringProcessor.bind(this)('[botName]'),
                                    showTimestamp: true
                                })).then(m => {
                                    m.delete({timeout: typeof this.config.insufficientPermissions.deleteTimeout == 'number' ? this.config.insufficientPermissions.deleteTimeout : 5000});
                                });
                            }
                        }
                    }
                    else {
                        if(this.config.commandNotFound instanceof Object) {
                            message.channel.send(EasyDiscordBot.createEmbed({
                                title: stringProcessor.bind(this)(this.config.commandNotFound.content ? this.config.commandNotFound.content.toString() : `🔍 Command "[command]" does not exist`, message),
                                color: this.config.commandNotFound.color ? this.config.commandNotFound.color : "#ff5500",
                                showTimestamp: true,
                                footer: stringProcessor.bind(this)('[botName]')
                            })).then(m => {
                                m.delete({timeout: typeof this.config.commandNotFound.deleteTimeout == 'number' ? this.config.commandNotFound.deleteTimeout : 5000});
                            })
                        }
                    }
                }
                else {
                    this.events.onMessage(message);
                }
            });
            if(!this.config.helpMessage || !this.config.helpMessage instanceof Object) {
                const helpCommandIndex = this.commands.list.findIndex(c => c.name == 'help');
                this.commands.list.splice(helpCommandIndex, 1);
            }
            else {
                this.commands.get('help').hidden = typeof this.config.helpMessage.hidden == 'boolean' ? this.config.helpMessage.hidden : false;
            }
            if(!this.config.showCommand || !this.config.showCommand instanceof Object || !this.config.showCommand.enabled) {
                const showCommandIndex = this.commands.list.findIndex(c => c.name == 'show');
                this.commands.list.splice(showCommandIndex, 1);
            }
            else {
                this.commands.get('show').hidden = typeof this.config.showCommand.hidden == 'boolean' ? this.config.showCommand.hidden : true;
            }
            await this.client.login(this.config.discordToken);
            if(this.config.botActivity && this.config.botActivity instanceof Object) {
                await this.client.user.setActivity(stringProcessor.bind(this)(this.config.botActivity.title.toString()), { type: this.config.botActivity.type ? this.config.botActivity.type.toString().toUpperCase() : 'PLAYING', url: this.config.botActivity.url ? this.config.botActivity.url.toString() : undefined });
            }
        }
        catch(e) {
            this.events.onError(e);
            return;
        }
    }
    addCommand(name, description, permissions, callFunction, keywords, usage, hidden) {
        //BACKWARDS COMPATIBILITY (DEPRECATED)
        try {
            console.warn('WARN! EasyDiscordBot.addCommand() is deprecated! Please use EasyDiscordBot.commands.add(options) instead.')
            const options = {
                name: name,
                description: description,
                permissions: permissions,
                execute: callFunction,
                keywords: keywords,
                usage: usage,
                hidden: hidden || false
            };
            return this.commands.add(options);
        }
        catch (e) {
            this.events.onError(e);
            return null;
        }
    }
    getCommand(name) {
        //BACKWARDS COMPATIBILITY (DEPRECATED)
        console.warn('WARN! EasyDiscordBot.getCommand() is deprecated! Please use EasyDiscordBot.commands.get(name) instead.')
        return this.commands.get(name);
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
            return null;
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
            else if(typeof guild == 'string') {
                guild = await this.getGuild(guild);
                if(guild) {
                    const role = await guild.roles.fetch(id);
                    if(role) {
                        return role;
                    }
                    else {
                        throw new ReferenceError(`Cannot find a role with ID ${id} in ${guild.name}`);
                    }
                }
                else {
                    throw new ReferenceError(`Cannot find the specified guild`);
                }
            }
            else {
                throw new TypeError('First parameter has to be an instance of the Guild class or a string.');
            }
        }
        catch (e) {
            return null;
        }
    }
    async getChannel(guild, id) {
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
            else if(typeof guild == 'string') {
                guild = await this.getGuild(guild);
                if(guild) {
                    const channel = guild.channels.cache.get(id);
                    if(channel) {
                        return channel;
                    }
                    else {
                        throw new ReferenceError(`Cannot find a channel with ID ${id} in ${guild.name}`)
                    }
                }
                else {
                    throw new ReferenceError(`Cannot find the specified guild`);
                }
            }
            else {
                throw new TypeError('First parameter has to be an instance of the Guild class or a string.');
            }
        }
        catch (e) {
            return null;
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
            else if(typeof guild == 'string') {
                guild = await this.getGuild(guild);
                if(guild) {
                    const user = await guild.members.fetch(id);
                    if(user) {
                        return user;
                    }
                    else {
                        throw new ReferenceError(`Cannot find a user with ID ${id} in ${guild.name}`)
                    }
                }
                else {
                    throw new ReferenceError(`Cannot find the specified guild`);
                }
            }
            else {
                throw new TypeError('First parameter has to be an instance of the Guild class or a string.');
            }
        }
        catch (e) {
            return null;
        }
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

export { EasyDiscordBot, stringProcessor, Command };