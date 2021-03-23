import { Role, GuildMember, User } from 'discord.js';

class DiscordBotCommand {
    constructor(params) {
        //INITIALIZE
        this.name = undefined;
        this.description = undefined;
        this.permissions = undefined;
        this.keywords = undefined;
        this.usage = undefined;
        this.hidden = undefined;

        //NAME
        if(params.name && typeof params.name == 'string') {
            this.name = params.name.toString().split(' ').join('');
            if(this.name.length === 0) {
                throw new Error('Incorrect command name');
            }
        }
        else {
            throw new TypeError('Command name is not a string');
        }

        //DESCRIPTION
        if(params.description && typeof params.description == 'string') {
            this.description = params.description.toString();
        }
        else {
            this.description = "No description";
        }

        //PERMISSIONS
        if(params.permissions) {
            if(params.permissions && typeof params.permissions == 'object') {
                this.permissions = {
                    permissions: undefined,
                    roles: undefined,
                    users: undefined
                };
                //PERMISSIONS
                if(params.permissions.permissions) {
                    const permissionsList = [
                        'ADMINISTRATOR', 'CREATE_INSTANT_INVITE', 'KICK_MEMBERS',
                        'BAN_MEMBERS', 'MANAGE_CHANNELS', 'MANAGE_GUILD',
                        'ADD_REACTIONS', 'VIEW_AUDIT_LOG', 'PRIORITY_SPEAKER',
                        'STREAM', 'VIEW_CHANNEL', 'SEND_MESSAGES',
                        'SEND_TTS_MESSAGES', 'MANAGE_MESSAGES', 'EMBED_LINKS',
                        'ATTACH_FILES', 'READ_MESSAGE_HISTORY', 'MENTION_EVERYONE',
                        'USE_EXTERNAL_EMOJIS', 'VIEW_GUILD_INSIGHTS',
                        'CONNECT', 'SPEAK', 'MUTE_MEMBERS',
                        'DEAFEN_MEMBERS', 'MOVE_MEMBERS', 'USE_VAD',
                        'CHANGE_NICKNAME', 'MANAGE_NICKNAMES', 'MANAGE_ROLES',
                        'MANAGE_WEBHOOKS', 'MANAGE_EMOJIS'
                    ];
                    this.permissions.permissions = [];
                    if(params.permissions.permissions instanceof Array) {
                        for(let i = 0; i < params.permissions.permissions.length; i++) {
                            if(permissionsList.findIndex(perm => perm == params.permissions.permissions[i].toString().toUpperCase()) !== -1) {
                                this.permissions.permissions.push(params.permissions.permissions[i].toString().toUpperCase());
                            }
                        }
                    }
                    else if(typeof params.permissions.permissions == 'string') {
                        if(permissionsList.findIndex(perm => perm == params.permissions.permissions.toUpperCase()) !== -1) {
                            this.permissions.permissions.push(params.permissions.permissions.toUpperCase());
                        }
                    }
                }
                //BACKWARDS COMPATIBILITY
                if(params.permissions.admin == true) {
                    console.warn(`WARN! The "admin" property is deprecated and support for it is going to be removed in the future. Please use { permissions: ['ADMINISTRATOR'] } instead.`)
                    this.permissions.permissions = [];
                    this.permissions.permissions.push('ADMINISTRATOR');
                }

                //ROLES
                if(params.permissions.roles) {
                    this.permissions.roles = [];
                    if(params.permissions.roles instanceof Array) {
                        for(let i = 0; i < params.permissions.roles.length; i++) {
                            if(params.permissions.roles[i] instanceof Role) {
                                this.permissions.roles.push(params.permissions.roles[i].id);
                            }
                            else {
                                this.permissions.roles.push(params.permissions.roles[i].toString());
                            }
                        }
                    }
                    else if(typeof params.permissions.roles == 'string') {
                        this.permissions.roles.push(params.permissions.roles);
                    }
                    else if(params.permissions.roles instanceof Role) {
                        this.permissions.roles.push(params.permissions.roles.id);
                    }
                }

                //USERS
                if(params.permissions.users) {
                    this.permissions.users = [];
                    if(params.permissions.users instanceof Array) {
                        for(let i = 0; i < params.permissions.users.length; i++) {
                            if(params.permissions.users instanceof GuildMember || params.permissions.users instanceof User) {
                                this.permissions.users.push(params.permissions.users[i].id);
                            }
                            else {
                                this.permissions.users.push(params.permissions.users[i].toString());
                            }
                        }
                    }
                    else if(typeof params.permissions.users == 'string') {
                        this.permissions.users.push(params.permissions.users);
                    }
                    else if(params.permissions.users instanceof GuildMember || params.permissions.users instanceof User) {
                        this.permissions.users.push(params.permissions.users[i].id);
                    }
                }
            }
            else {
                console.warn(`Incorrect permissions for ${this.name}. Defaulting to: everyone`);
            }
        }

        //KEYWORDS
        if(params.keywords) {
            this.keywords = [];
            if(params.keywords instanceof Array) {
                for(let i = 0; i < params.keywords.length; i++) {
                    this.keywords.push(params.keywords[i].toString().split(' ').join(''));
                }
            }
            else if(typeof params.keywords == 'string') {
                this.keywords.push(params.keywords.toUpperCase().split(' ').join(''));
            }
        }

        //USAGE
        if(params.usage) {
            this.usage = params.usage.toString();
        }

        //EXECUTION
        if(params.execute) {
            if(params.execute instanceof Function) {
                this.execute = params.execute;
            }
        }

        //HIDE
        if(params.hidden) {
            this.hidden = true;
        }
        else {
            this.hidden = false;
        }
    }
    execute(message) {
        console.warn(`The command ${this.name} has no execute function specified or the function is incorrect.`)
        return;
    }
}

export { DiscordBotCommand };