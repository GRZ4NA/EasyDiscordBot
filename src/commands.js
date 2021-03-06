import { Role, GuildMember, User } from 'discord.js';

class Command {
    constructor(params) {
        //INITIALIZE
        this.name = undefined;
        this.aliases = undefined;
        this.description = undefined;
        this.permissions = undefined;
        this.keywords = undefined;
        this.usage = undefined;
        this.hidden = undefined;

        //NAME
        if(params.name) {
            if(typeof params.name == 'string') {
                this.name = params.name.toString().split(' ').join('');
                if(this.name.length === 0) {
                    throw new Error('Incorrect command name');
                }
            }
            else if(params.name instanceof Array) {
                if(params.name.length == 0) {
                    throw new RangeError('Name array cannot be empty');
                }
                this.name = params.name[0].toString().split(' ').join('');
                if(this.name.length === 0) {
                    throw new Error('Incorrect command name');
                }
                params.name.splice(0, 1);
                if(params.name.length !== 0) {
                    this.aliases = [];
                    for(let i = 0; i < params.name.length; i++) {
                        params.name[i] = params.name[i].toString().split(' ').join('');
                        if(params.name[i].length !== 0) {
                            this.aliases.push(params.name[i]);
                        }
                    }
                    if(this.aliases.length === 0) {
                        this.aliases = undefined;
                    }
                }
            }
        }
        else {
            throw new TypeError('Command name is not a string or array');
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

class CommandManager {
    constructor() {
        this.list = [];
    }
    get(name) {
        try {
            if(typeof name == 'string') {
                const command = this.list.find(c => c.name == name);
                if(command) {
                    return command;
                }
                else {
                    for(let i = 0; i < this.list.length; i++) {
                        if(this.list[i].aliases) {
                            const alias = this.list[i].aliases.find(a => a == name);
                            if(alias) {
                                return this.list[i];
                            }
                        }
                    }
                    throw new ReferenceError(`Command ${name} does not exist in this instance.`);
                }
            }
            else {
                throw new TypeError('The first argument has to be a string');
            }
        }
        catch (e) {
            return null;
        }
    }
    add(options) {
        try {
            let command;
            if(options instanceof Command) {
                command = options;
            }
            else if(typeof options == 'object') {
                command = new Command(options);
            }
            else {
                throw new TypeError('The first argument has to be a Command instance or an object');
            }

            if(this.get(command.name)) {
                throw new ReferenceError(`The command with name ${command.name} already exists in this instance.`);
            }
            if(command.aliases && Array.isArray(command.aliases)) {
                for(let i = 0; i < command.aliases.length; i++) {
                    if(this.get(command.aliases[i])) {
                        console.warn(`The alias "${command.aliases[i]}" is already registered as a command name or an alias for some other command in this instance. It will be removed from the "${command.name}" command.`);
                        command.aliases.splice(i, 1);
                        i--;
                    }
                }
                if(command.aliases.length == 0) {
                    command.aliases = undefined;
                }
            }
            if(command instanceof Command) {
                this.list.push(command);
            }
        }
        catch (e) {
            console.error(e);
            return null;     
        }
    }
}

export { CommandManager, Command };