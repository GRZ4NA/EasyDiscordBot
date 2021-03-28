function stringProcessor(string, message) {
    if(typeof string == 'string') {
        string = string.split('[botName]').join(this.name);
        string = string.split('[prefix]').join(this.config.prefix);
        string = string.split('[command]').join(message && message.command && message.command.isCommand ? message.command.name : "");
        return string;
    }
    else {
        return string;
    }
}

export { stringProcessor };