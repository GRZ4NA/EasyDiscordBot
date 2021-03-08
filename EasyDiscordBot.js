import { Client } from "discord.js";
import http from 'http';

class EasyDiscordBot {
    constructor(params) {
        try {
            this.client = new Client();
            this.name = params.name;
            this.version = params.version ? params.version : "1.0.0";
            this.discordToken = params.discordToken;
            this.isPreRelease = params.isPreRelease ? params.isPreRelease : false;
            if(params.prefix && params.prefix instanceof String) {
                this.prefix = params.prefix;
            }
            else {
                throw new Error('Please specify a prefix.');
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
            this = undefined;
            return undefined;
        }
    }
    async start(port) {
        console.log(`Bot name: ${this.name}`);
        console.log(`Bot version: ${this.version}`);
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
}

export default EasyDiscordBot;