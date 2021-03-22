function createHelpCommandsList(botInstance) {
    const commands = [];
    for(let i = 0; i < botInstance.commandsList.length; i++) {
        if(!botInstance.commandsList[i].hidden) {
            const commandObj = { inline: false };
            commandObj.title = botInstance.config.prefix + botInstance.commandsList[i].name;
            commandObj.value = botInstance.stringProcessor(botInstance.commandsList[i].description);
            commands.push(commandObj);
        }
    }
    return commands;
}

async function createCommandHelp(botInstance, command, message) {
    const permissions = command.permissions;
    const fields = [];
    if(command.usage && typeof command.usage == 'string' && command.usage.length !== 0) {
        fields.push({
            title: 'Usage:',
            value: botInstance.config.prefix + command.name + ' ' + botInstance.stringProcessor(command.usage, { command: { isCommand: true, name: command.name } }),
            inline: false
        });
    }
    if(command.keywords && command.keywords.length !== 0) {
        fields.push({
            title: "Keywords:",
            value: command.keywords.join(', '),
            inline: false
        });
    }
    if(typeof permissions == 'object') {
        if(permissions.permissions instanceof Array && permissions.permissions.length > 0) {
            fields.push({ title: "Permissions:", value: permissions.permissions.join(', '), inline: false });
        }
        if(permissions.roles instanceof Array && permissions.roles.length > 0) {
            const roleArray = [];
            for(let i = 0; i < permissions.roles.length; i++) {
                const role = await botInstance.getRole(message.guild, permissions.roles[i]);
                if(role) {
                    roleArray.push(role.name);
                }
            }
            if(roleArray.length > 0) { fields.push({ title: "Roles:", value: roleArray.join(', '), inline: false }); }
        }
        if(permissions.users instanceof Array && permissions.users.length > 0) {
            const userArray = [];
            for(let i = 0; i < permissions.users.length; i++) {
                const user = await botInstance.getUser(message.guild, permissions.users[i]);
                if(user) {
                    userArray.push(user.user.username + '#' + user.user.discriminator);
                }
            }
            if(userArray.length > 0) { fields.push({ title: "Users:", value: userArray.join(', '), inline: false }); }
        }
    }
    return fields;
}

export { createCommandHelp, createHelpCommandsList };