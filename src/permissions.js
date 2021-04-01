import { Message } from 'discord.js';
import { Command } from './commands.js';

async function checkCommandAccess(message, command) {
    try {
        if(!message instanceof Message || !command instanceof Command) {
            throw new TypeError('Cannot check user permissions. Incorrect arguments.');
        }
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

export { checkCommandAccess };