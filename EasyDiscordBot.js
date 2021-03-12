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
                    admin: false,
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
                return;
            }
            this.onMessage = message => {

            };
            this.onCommand = command => {

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
            await this.client.login(this.discordToken);
            this.client.on('ready', () =>{
                console.log('Connected!');
                console.log(' ');
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
                if(message.command.isCommand) {
                    this.onCommand(message);
                    if(this.getCommand(message.command.name)) {
                        this.getCommand(message.command.name).exec(message);
                    }
                    else {
                        message.reply(this.responseTable.commandNotFound.replace('[command]', message.command.name));
                    }
                }
                else {
                    this.onMessage(message);
                }
            });
        }
        catch(e) {
            console.error('An error occured during login procedure. If this problem persists please check your app token.');
            process.abort();
        }
    }
    addCommand(name, description, requiresAdmin, callFunction) {
        const commandObject = {
            name: name.toString(),
            description: description.toString(),
            admin: requiresAdmin instanceof Boolean ? requiresAdmin : false,
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
            if(name instanceof String) {
                if(this.commandsList.findIndex(c => c.name == name) !== -1) {
                    return this.commandsList.find(c => c.name == name);
                }
                else {
                    throw new ReferenceError(`Command ${name} does not exist in this instance.`);
                }
            }
            else if(name instanceof Number) {
                const index = this.commandsList.findIndex(c => c.name == name);
                if(index !== -1) {
                    return this.commandsList[index];
                }
                else {
                    throw new ReferenceError(`Command ${name} does not exist in this instance.`);
                }
            }
            else {
                return 0;
            }
        }
        catch (e) {
            console.error(e);
            return false;
        }
    }
}

export default EasyDiscordBot;