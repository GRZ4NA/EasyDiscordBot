import { GuildMember, Role, VoiceChannel, TextChannel, CategoryChannel, Guild } from 'discord.js';

async function generateShowCommand(object, botInstance) {
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
        if(object.user.createdAt) {
            fields.push({title: 'Account creation date:', value: object.user.createdAt.toLocaleDateString(undefined, dateFormatting), inline: false});
        }
        if(object.joinedAt) {
            fields.push({title: `Joined server at:`, value: object.joinedAt.toLocaleDateString(undefined, dateFormatting), inline: false});
        }
        if(object.roles) {
            let roles = object.roles.cache.array();
            for(let i = 0; i < roles.length; i++) {
                roles[i] = roles[i].name;
            }
            fields.push({title: 'Roles:', value: roles.join(' \n'), inline: false});
        }
        if(object.permissions.toArray().length > 0) {
            fields.push({title: 'Permissions:', value: object.permissions.toArray().join(' \n'), inline: false});
        }
        return {
            title: object.nickname ? `${object.nickname}\n${object.user.tag}` : object.user.tag,
            description: `${'- ' + object.user.presence.status.toUpperCase() + '\n'}${object.guild.ownerID === object.id ? "- SERVER OWNER \n" : ""}${object.user.bot ? "- BOT \n" : ""}`,
            showTimestamp: true,
            color: botInstance.config.accentColor ? botInstance.config.accentColor : '#666666',
            thumbnail: object.user.displayAvatarURL(),
            fields: fields,
            footer: `ID: ${object.id}`
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
            color: botInstance.config.accentColor ? botInstance.config.accentColor: '#666666',
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
            color: botInstance.config.accentColor ? botInstance.config.accentColor: '#666666',
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
            description: 'Category channel',
            footer: `ID: ${object.id}`,
            color: botInstance.config.accentColor ? botInstance.config.accentColor : '#666666',
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
        return {
            title: object.name,
            description: object.members.array().length == 1 ? `${object.members.array().length} member has this role` : `${object.members.array().length} members have this role`,
            color: object.hexColor != '#000000' ? object.hexColor : botInstance.config.accentColor ? botInstance.config.accentColor : '#666666',
            footer: `ID: ${object.id}`,
            showTimestamp: true,
            fields: fields
        }
    }
    else if(object instanceof Guild) {
        if(object.owner) {
            fields.push({
                title: 'Server owner:',
                value: object.owner.user.tag,
                inline: false
            });
        }
        if(object.createdAt) {
            fields.push({
                title: 'Server creation date:',
                value: object.createdAt.toLocaleDateString(undefined, dateFormatting),
                inline: false
            });
        }
        if(object.region) {
            fields.push({
                title: 'Region:',
                value: object.region.charAt(0).toUpperCase() + object.region.slice(1).toLowerCase(),
                inline: false
            });
        }
        if(object.premiumTier !== 0) {
            fields.push({
                title: 'Server boosting:',
                value: `Tier ${object.premiumTier}`,
                inline: false
            });
        }
        if(object.afkChannel) {
            fields.push({
                title: 'AFK channel:',
                value: object.afkChannel.name,
                inline: false
            });
        }
        if(object.verified) {
            fields.push({
                title: 'Verified:',
                value: 'YES',
                inline: true
            });
        }
        if(object.partnered) {
            fields.push({
                title: 'Partnered:',
                value: 'YES',
                inline: true
            });
        }
        if(object.memberCount) {
            fields.push({
                title: 'Members:',
                value: object.memberCount,
                inline: true
            });
        }
        if(object.channels.cache) {
            fields.push({
                title: 'Channels:',
                value: object.channels.cache.array().length,
                inline: true
            });
        }
        if(object.roles.cache) {
            fields.push({
                title: 'Roles:',
                value: object.roles.cache.array().length,
                inline: true
            });
        }
        if(object.emojis.cache && object.emojis.cache.array().length !== 0) {
            fields.push({
                title: 'Emotes:',
                value: object.emojis.cache.array().length,
                inline: true
            });
        }
        return {
            title: object.name,
            description: object.description ? object.description : "",
            color: botInstance.config.accentColor ? botInstance.config.accentColor : '#666666',
            footer: `ID: ${object.id}`,
            showTimestamp: true,
            fields: fields,
            thumbnail: object.me.user.displayAvatarURL()
        }
    }
}

export { generateShowCommand }