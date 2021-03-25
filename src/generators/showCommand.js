import { GuildMember, Role, VoiceChannel, TextChannel, CategoryChannel } from 'discord.js';

async function generateShowCommand(object, color, botInstance) {
    const fields = [];
    const dateFormatting = {weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'};
    if(object instanceof GuildMember) {
        if(object.user.presence.activities.length > 0) {
            const activities = object.user.presence.activities;
            const formatted = [];
            for(let i = 0; i < activities.length; i++) {
                if(activities[i].type != 'CUSTOM_STATUS') {
                    formatted.push(`- ${activities[i].type.charAt(0)}${activities[i].type.slice(1).toLowerCase()}: ${activities[i].name}${activities[i].url ? ' - ' + activities[i].url : ''}${activities[i].state ? ' - ' + activities[i].state  : ''}${activities[i].details ? ' - ' + activities[i].details : ''} \n`);
                }
            }
            if(formatted.length > 0) {
                fields.push({title: 'Activities:', value: formatted.join(' '), inline: false});
            }
        }
        if(object.roles) {
            let roles = object.roles.cache.array();
            for(let i = 0; i < roles.length; i++) {
                roles[i] = roles[i].name;
            }
            fields.push({title: 'Roles:', value: roles.join(', '), inline: false});
        }
        if(object.user.createdAt) {
            fields.push({title: 'Account creation date:', value: object.user.createdAt.toLocaleDateString(undefined, dateFormatting), inline: false});
        }
        if(object.joinedAt) {
            fields.push({title: `Joined server at:`, value: object.joinedAt.toLocaleDateString(undefined, dateFormatting), inline: false});
        }
        if(object.permissions.toArray().length > 0) {
            fields.push({title: 'Permissions:', value: object.permissions.toArray().join(' \n'), inline: false});
        }
        return {
            title: object.nickname ? object.nickname : object.user.tag,
            description: `${object.nickname ? object.user.tag + ' -'  : ''} ${object.user.presence.status.toUpperCase()}`,
            showTimestamp: true,
            color: color ? color : '#666666',
            thumbnail: object.user.displayAvatarURL(),
            fields: fields,
            footer: `${object.user.bot ? "[BOT]" : ""} ID: ${object.id}`
        }
    }
    else if(object instanceof VoiceChannel) {
        if(object.parent) {
            fields.push({title: 'Parent:', value: object.parent.name, inline: false});
        }
        if(object.userLimit || object.members) {
            fields.push({title: 'Connected:', value: object.userLimit ? `${object.members.array().length}/${object.userLimit}` : object.members.array().length, inline: false});
        }
        if(object.bitrate) {
            fields.push({title: 'Bitrate:', value: object.bitrate, inline: false});
        }
        if(object.permissionOverwrites) {
            const overwrites = object.permissionOverwrites.array();
            for(let i = 0; i < overwrites.length; i++) {
                let serverObject;
                if(overwrites[i].type == 'member') {
                    serverObject = await botInstance.getUser(object.guild, overwrites[i].id);
                    serverObject = serverObject.displayName;
                }
                else {
                    serverObject = await botInstance.getRole(object.guild, overwrites[i].id);
                    serverObject = serverObject.name;
                }

                let allowedString, deniedString;
                if(overwrites[i].allow.toArray().length > 0) {
                    allowedString = "Allowed: \n";
                    allowedString += overwrites[i].allow.toArray().join(' \n');
                }
                if(overwrites[i].deny.toArray().length > 0) {
                    deniedString = "Denied: \n";
                    deniedString += overwrites[i].deny.toArray().join(' \n');
                }
                const perms = allowedString ? allowedString : "" + " \n" + deniedString ? deniedString : ""; 
                if(perms) {
                    fields.push({
                        title: `Permissions for: ${serverObject}`,
                        value: perms,
                        inline: false
                    });
                }
            }
        }
        return {
            title: object.name,
            description: "Voice Channel",
            footer: `ID: ${object.id}`,
            color: color ? color: '#666666',
            showTimestamp: true,
            fields: fields
        }
    }
    else if(object instanceof TextChannel) {
        if(object.parent) {
            fields.push({title: 'Parent:', value: object.parent.name, inline: false});
        }
        if(object.nsfw) {
            fields.push({title: 'NSFW:', value: 'YES', inline: false});
        }
        if(object.permissionOverwrites) {
            const overwrites = object.permissionOverwrites.array();
            for(let i = 0; i < overwrites.length; i++) {
                let serverObject;
                if(overwrites[i].type == 'member') {
                    serverObject = await botInstance.getUser(object.guild, overwrites[i].id);
                    serverObject = serverObject.displayName;
                }
                else {
                    serverObject = await botInstance.getRole(object.guild, overwrites[i].id);
                    serverObject = serverObject.name;
                }

                let allowedString, deniedString;
                if(overwrites[i].allow.toArray().length > 0) {
                    allowedString = "Allowed: \n";
                    allowedString += overwrites[i].allow.toArray().join(' \n');
                }
                if(overwrites[i].deny.toArray().length > 0) {
                    deniedString = "Denied: \n";
                    deniedString += overwrites[i].deny.toArray().join(' \n');
                }
                const perms = allowedString ? allowedString : "" + " \n" + deniedString ? deniedString : ""; 
                if(perms) {
                    fields.push({
                        title: `Permissions for: ${serverObject}`,
                        value: perms,
                        inline: false
                    });
                }
            }
        }
        return {
            title: object.name,
            description: object.topic ? object.topic : "Text channel",
            footer: `ID: ${object.id}`,
            color: color ? color: '#666666',
            showTimestamp: true,
            fields: fields
        }
    }
    else if(object instanceof CategoryChannel) {
        if(object.children) {
            for(let i = 0; i < object.children.array().length; i++) {
                fields.push({
                    title: object.children.array()[i].name,
                    value: object.children.array()[i].type.charAt(0).toUpperCase() + object.children.array()[i].type.slice(1) + ' channel',
                    inline: false
                });
            }
        }
        return {
            title: object.name,
            description: 'Category channel',
            footer: `ID: ${object.id}`,
            color: color ? color : '#666666',
            showTimestamp: true,
            fields: fields
        }
    }
    else if(object instanceof Role) {
        if(object.color) {
            fields.push({
                title: 'Color:',
                value: `${object.color} (${object.hexColor})`,
                inline: false
            });
        }
        if(object.permissions.toArray().length > 0) {
            fields.push({
                title: 'Permissions:',
                value: object.permissions.toArray().join(' \n'),
                inline: false
            });
        }
        if(object.permissionOverwrites) {
            const overwrites = object.permissionOverwrites.array();
            for(let i = 0; i < overwrites.length; i++) {
                let serverObject;
                if(overwrites[i].type == 'member') {
                    serverObject = await botInstance.getUser(object.guild, overwrites[i].id);
                    serverObject = serverObject.displayName;
                }
                else {
                    serverObject = await botInstance.getRole(object.guild, overwrites[i].id);
                    serverObject = serverObject.name;
                }

                let allowedString, deniedString;
                if(overwrites[i].allow.toArray().length > 0) {
                    allowedString = "Allowed: \n";
                    allowedString += overwrites[i].allow.toArray().join(' \n');
                }
                if(overwrites[i].deny.toArray().length > 0) {
                    deniedString = "Denied: \n";
                    deniedString += overwrites[i].deny.toArray().join(' \n');
                }
                const perms = allowedString ? allowedString : "" + " \n" + deniedString ? deniedString : ""; 
                if(perms) {
                    fields.push({
                        title: `Permissions for: ${serverObject}`,
                        value: perms,
                        inline: false
                    });
                }
            }
        }
        return {
            title: object.name,
            description: object.members.array().length == 1 ? `${object.members.array().length} member has this role` : `${object.members.array().length} members have this role`,
            color: object.hexColor != '#000000' ? object.hexColor : color ? color : '#666666',
            footer: `ID: ${object.id}`,
            showTimestamp: true,
            fields: fields
        }
    }
}

export { generateShowCommand }