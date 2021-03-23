import { GuildMember, Role, VoiceChannel, TextChannel, CategoryChannel } from 'discord.js';

async function generateShowCommand(object, color) {
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
        if(object.premiumSince) {
            fields.push({title: 'Server booster since:', value: object.premiumSince.toLocaleDateString(undefined, dateFormatting), inline: false})
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
            fields.push({title: 'Users:', value: object.userLimit ? `${object.members.array().length}/${object.userLimit}` : object.members.array().length, inline: false});
        }
        if(object.permissionsLocked === false) {
            fields.push({title: "Private channel:", value: 'YES', inline: false});
        }
        if(object.bitrate) {
            fields.push({title: 'Bitrate:', value: object.bitrate, inline: false});
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
        if(object.permissionsLocked === false) {
            fields.push({title: "Private channel:", value: 'YES', inline: false});
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
        if(object.hoist) {
            fields.push({
                title: 'Separated:',
                value: 'YES',
                inline: false
            });
        }
        if(object.mentionable) {
            fields.push({
                title: 'Can be mentioned:',
                value: 'YES',
                inline: false
            });
        }
        if(object.color) {
            fields.push({
                title: 'Color:',
                value: `${object.color} (${object.hexColor})`,
                inline: false
            });
        }
        return {
            title: object.name,
            description: `Users: ${object.members.array().length}`,
            color: object.hexColor != '#000000' ? object.hexColor : color ? color : '#666666',
            footer: `ID: ${object.id}`,
            showTimestamp: true,
            fields: fields
        }
    }
}

export { generateShowCommand }