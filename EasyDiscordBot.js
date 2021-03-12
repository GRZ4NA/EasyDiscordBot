import { Client } from "discord.js";
import http from 'http';

class EasyDiscordBot {
    constructor(params) {
        try {
            this.client = new Client();
            this.commandsList = [
                {
                    name: 'version',
                    description: "This command displays your bot's version.",
                    permissions: 0,
                    exec: async m => {
                        await m.reply(`${this.name} version ${this.version}`);
                    }
                }
            ];
            this.responseTable = {
                commandNotFound: 'The command [command] does not exist.',
                insufficientPermissions: "You don't have the required permissions to use this command.",
                userNotConnected: "In order to use this command you have to be connected to a voice channel."
            }
            this.name = params.name;
            this.version = params.version ? params.version : "1.0.0";
            this.discordToken = params.discordToken;
            this.isPreRelease = params.isPreRelease ? params.isPreRelease : false;
            if(params.prefix) {
                this.prefix = params.prefix.toString();
            }
            else {
                console.warn('Prefix has not been specified. Using default prefix (!)');
                this.prefix = '!';
            }

            this.onReady = () => {
                console.log('Connected!');
                console.log(' ');
                return;
            }
            this.onMessage = message => {
                console.log(`${message.author.username} (${message.channel.name}): ${message.content}`);
            };
            this.onCommand = command => {
                console.log(`${command.author.username} (${command.channel.name}): ${command.content}`);
                console.log(command.command);
            }
            this.onError = error => {
                console.error(error);
            };
        }
        catch (e) {
            console.error(e);
            console.warn('NOTICE! This module is based of off discord.js library. To use it please install Discord.js in your project (npm i discord.js)');
            return undefined;
        }
    }
    async start(port) {
        console.log(`Bot name: ${this.name}`);
        console.log(`Bot version: ${this.version}`);
        console.log(`Bot prefix: ${this.prefix}`);
        console.log('Based on discord.js library & EasyDiscordBot wrapper created by GRZANA (https://github.com/GRZ4NA)');
        if(this.isPreRelease) { console.warn('This version is marked as a pre-release version. You may encouter some bug and stability problems.'); }
        console.log(' ');
        try {
            if(port) {
                console.log('A port has been specified. Creating http server...');
                http.createServer().listen(port);
                console.log(`Listening on port ${port}`);
            }
            console.log('Connecting to Discord...');
            this.client.on('ready', () =>{
                this.onReady();
                return true;
            });
            this.client.on('error', e => this.onError(e));
            this.client.on('message', message => {
                message.command = {};
                if(message.content.startsWith(this.prefix) && !message.content.replace(this.prefix, '').startsWith(this.prefix)) {
                    message.command.isCommand = true;
                    message.command.name = message.content.replace(this.prefix, '').split(' ')[0];
                    message.command.arguments = message.content.replace(this.prefix, '').replace(message.command.name, '').split(', ');
                }
                else {
                    message.command.isCommand = false;
                }
                if(message.command.isCommand && !message.author.bot) {
                    this.onCommand(message);
                    const command = this.getCommand(message.command.name);
                    if(command) {
                        if(this.permissionsProxy(message, command)) {
                            command.exec(message);
                        }
                    }
                    else {
                        message.reply(this.responseTable.commandNotFound.replace('[command]', message.command.name));
                    }
                }
                else {
                    this.onMessage(message);
                }
            });
            await this.client.login(this.discordToken);
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
        return this.commandsList.findIndex(c => c.name == commandObject.name);
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
    getCommandById(id) {
        try {
            if(this.commandsList[id]) {
                return this.commandsList[id];
            }
            else {
                throw new ReferenceError(`Command with id ${id} does not exist in this instance.`);
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
}

export default EasyDiscordBot;