import { Client } from "discord.js";
import http from 'http';

class EasyDiscordBot {
    constructor(name, discordToken, version, isPreRelease) {
        try {
            this.client = new Client();
            this.name = name;
            this.version = version ? version : "1.0.0";
            this.discordToken = discordToken;
            this.isPreRelease = isPreRelease ? isPreRelease : false;
        }
        catch (e) {
            console.error(e);
            console.warn('This module is based of off discord.js library. To use it please install Discord.js in your project (npm i discord.js)');
            this = undefined;
            return undefined;
        }
    }
    start() {
        console.log(`Bot name: ${this.name}`);
        console.log(`Bot version: ${this.version}`);
        console.log('Based on discord.js library & EasyDiscordBot wrapper created by GRZANA (https://github.com/GRZ4NA)');
        if(this.isPreRelease) { console.warn('This version is marked as a pre-release version.'); }
    }
}

export default DiscordBot;