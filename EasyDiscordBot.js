import "discord.js";
import { Client, MessageEmbed } from "discord.js";
import http from 'http';

class EasyDiscordBot {
    constructor(params) {
        try {
            this.bot = {
                client: new Client(),
                name: params.name.toString(),
                version: params.version ? params.version.toString() : "1.0.0"
            };
            this.config = {
                discordToken: params.discordToken.toString(),
                prefix: params.prefix ? params.prefix.toString() : () => { console.warn('Prefix has not been specified. Using default prefix (!)'); return "!"; },
                botMessageDeleteTimeout: 5000,
                accentColor: "#000",
                responseTable: {
                    commandNotFound: 'The command [command] does not exist.',
                    insufficientPermissions: "You don't have the required permissions to use this command.",
                    userNotConnected: "In order to use this command you have to be connected to a voice channel."
                }
            };
            this.commandsList = [
                {
                    name: 'version',
                    description: "This command displays your bot's version.",
                    permissions: 0,
                    exec: async m => {
                        await m.reply(`${this.bot.name} version ${this.bot.version}`);
                    }
                },
                {
                    name: 'help',
                    description: "Displays list of available commands",
                    permissions: 0,
                    exec: async m => {
                        const commands = [];
                        for(let i = 0; i < this.commandsList.length; i++) {
                            const commandObj = { inline: false };
                            commandObj.title = this.commandsList[i].name;
                            commandObj.value = this.commandsList[i].description;
                            commands.push(commandObj);
                        }
                        const message = EasyDiscordBot.createEmbed({
                            title: `Help for ${this.bot.name}`,
                            color: this.config.accentColor,
                            description: 'List of available commands',
                            footer: `${this.bot.name} ${this.bot.version}`,
                            fields: commands
                        });
                        await m.channel.send(message);
                    }
                }
            ];
            this.events = {
                onReady: () => {
                    console.log('Connected!');
                    console.log(' ');
                    return;
                },
                onMessage: message => {
                    console.log(`${message.author.username} (${message.channel.name}): ${message.content}`);
                },
                onCommand: command => {
                    console.log(`${command.author.username} (${command.channel.name}): ${command.content}`);
                    console.log(command.command);
                },
                onError: error => {
                    console.error(error);
                }
            };
        }
        catch (e) {
            console.error(e);
            console.warn('NOTICE! This module is based of off discord.js library. To use it please install Discord.js in your project (npm i discord.js)');
            return undefined;
        }
    }
    async start(port) {
        console.log(`Bot name: ${this.bot.name}`);
        console.log(`Bot version: ${this.bot.version}`);
        console.log(`Bot prefix: ${this.config.prefix}`);
        console.log('Based on discord.js library & EasyDiscordBot wrapper created by GRZANA (https://github.com/GRZ4NA)');
        console.log(' ');
        try {
            if(port) {
                console.log('A port has been specified. Creating http server...');
                this.config.port = port;
                http.createServer().listen(this.config.port);
                console.log(`Listening on port ${this.config.port}`);
            }
            console.log('Connecting to Discord...');
            this.bot.client.on('ready', () =>{
                this.events.onReady();
                return true;
            });
            this.bot.client.on('error', e => this.events.onError(e));
            this.bot.client.on('message', message => {
                message.command = {};
                if(message.content.startsWith(this.config.prefix) && !message.content.replace(this.config.prefix, '').startsWith(this.config.prefix)) {
                    message.command.isCommand = true;
                    message.command.name = message.content.replace(this.config.prefix, '').split(' ')[0];
                    message.command.arguments = message.content.replace(this.config.prefix, '').replace(message.command.name, '').split(', ');
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
                            message.reply(this.config.responseTable.insufficientPermissions).then(m => { if(this.config.botMessageDeleteTimeout) { m.delete({ timeout: this.config.botMessageDeleteTimeout }) } });
                        }
                    }
                    else {
                        message.reply(this.config.responseTable.commandNotFound.replace('[command]', message.command.name)).then(m => { if(this.config.botMessageDeleteTimeout) { m.delete({ timeout: this.config.botMessageDeleteTimeout }) } });
                    }
                }
                else {
                    this.events.onMessage(message);
                }
            });
            await this.bot.client.login(this.config.discordToken);
        }
        catch(e) {
            console.error('An error occured during login procedure. If this problem persists please check your app token.');
            process.abort();
        }
    }
    addCommand(name, description, permissions, callFunction) {
        const commandObject = {
            name: name.toString(),
            description: description.toString(),
            permissions: permissions && permissions instanceof Object ? permissions : 0,
            exec: callFunction && callFunction instanceof Function ? callFunction : m => {
                return false;
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
            return false;
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
                    message.addField(params.fields[i].title, params.fields[i].value, params.fields[i].inline && params.fields[i].inline instanceof Boolean ? params.fields[i].inline : false);
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