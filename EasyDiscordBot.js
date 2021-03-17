import { Client, MessageEmbed } from "discord.js";
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
                responses: {
                    commandNotFound: 'The command "[command]" does not exist.',
                    insufficientPermissions: `You don't have the required permissions to use the "[command]" command.`
                },
                helpMessage: {
                    header: `Help for [name]`,
                    description: `List of available commands`
                }
            };
            this.commandsList = [
                {
                    name: 'help',
                    description: "Displays list of available commands",
                    permissions: 0,
                    exec: async m => {
                        const commands = [];
                        for(let i = 0; i < this.commandsList.length; i++) {
                            const commandObj = { inline: false };
                            commandObj.title = this.config.prefix + this.commandsList[i].name;
                            commandObj.value = this.commandsList[i].description;
                            commands.push(commandObj);
                        }
                        const message = EasyDiscordBot.createEmbed({
                            title: this.config.helpMessage.header.split('[name]').join(this.name),
                            color: this.config.accentColor,
                            description: this.config.helpMessage.description.split('[name]').join(this.name),
                            footer: this.name,
                            fields: commands
                        });
                        await m.channel.send(message);
                    }
                }
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
                onError: error => {
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
        console.log(`Bot name: ${this.name}`);
        console.log(`Bot prefix: ${this.config.prefix}`);
        console.log(' ');
        try {
            if(!this.config.discordToken) {
                throw new Error('The Discord bot token is not specified. Please include your token in the constructor or add it by using the discordToken config property.');
            }
            if(port) {
                console.log('Creating http server...');
                this.config.port = port;
                http.createServer().listen(this.config.port);
                console.log(`Listening on port ${this.config.port}`);
            }
            console.log('Connecting to Discord...');
            this.client.on('ready', () =>{
                this.events.onReady();
                return true;
            });
            this.client.on('error', e => this.events.onError(e));
            this.client.on('message', message => {
                message.command = {};
                if(message.content.startsWith(this.config.prefix) && !message.content.replace(this.config.prefix, '').startsWith(this.config.prefix)) {
                    message.command.isCommand = true;
                    message.command.name = message.content.replace(this.config.prefix, '').split(' ')[0];
                    message.command.arguments = message.content.replace(this.config.prefix, '').replace(message.command.name, '').split(', ');
                    message.command.arguments[0] = message.command.arguments[0].replace(' ', '');
                }
                else {
                    message.command.isCommand = false;
                }
                if(message.command.isCommand && !message.author.bot) {
                    this.events.onCommand(message);
                    const command = this.getCommand(message.command.name);
                    if(command) {
                        if(this.permissionsProxy(message, command)) {
                            command.exec instanceof Function ? command.exec(message) : m => { console.error(`The exec property on ${command.name} is not a function`); return; };
                        }
                        else {
                            message.reply(this.config.responses.insufficientPermissions.split('[command]').join(message.command.name)).then(m => { if(this.config.botMessageDeleteTimeout) { m.delete({ timeout: this.config.botMessageDeleteTimeout }) } });
                        }
                    }
                    else {
                        message.reply(this.config.responses.commandNotFound.split('[command]').join(message.command.name)).then(m => { if(this.config.botMessageDeleteTimeout) { m.delete({ timeout: this.config.botMessageDeleteTimeout }) } });
                    }
                }
                else {
                    this.events.onMessage(message);
                }
            });
            await this.client.login(this.config.discordToken);
        }
        catch(e) {
            console.error(e);
            return;
        }
    }
    addCommand(name, description, permissions, callFunction) {
        const commandObject = {
            name: name.toString(),
            description: description.toString(),
            permissions: permissions && permissions instanceof Object ? permissions : 0,
            exec: callFunction && callFunction instanceof Function ? callFunction : m => {
                console.warn(`The command ${name} has no execute function specified.`)
                return;
            }
        }
        if(this.getCommand(name)) {
            console.error(`The command ${name} already exists in this instance.`)
            return;
        }
        this.commandsList.push(commandObject);
        return this.commandsList.find(c => c.name == commandObject.name);
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
    permissionsProxy(message, command) {
        if(command.permissions === 0) {
            return true;
        }
        if(command.permissions.users && command.permissions.users instanceof Array) {
            if(command.permissions.users.findIndex(u => u == message.author.id) !== -1) {
                return true;
            }
        }
        if(command.permissions.roles && command.permissions.roles instanceof Array) {
            const userRoles = message.member.roles.cache.array();
            for(let i = 0; i < userRoles.length; i++) {
                if(command.permissions.roles.findIndex(r => r == userRoles[i]) !== -1) {
                    return true;
                }
            }
        }
        if(command.permissions.admin) {
            if(message.member.hasPermission("ADMINISTRATOR")) {
                return true;
            }
        }
        return false;
    }
    static createEmbed(params) {
        try {
            const message = new MessageEmbed()
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