const Command = require("../structs/Command");
const DB = require("quick.db")
const config = {
    prefix: process.env.PREFIX || "!",
    token: process.env.TOKEN || "Bitch no token here!"
};
module.exports = new Command({
    name: "prefix",
    aliases: ["pf", "pre"],
    description: "Shows prefix / sets it!",
    dmOnly: false,
    async run(message, args, client, opts) {
        let prefix = DB.get(message.guild.id) || config.prefix
        if(!args[0]) return message.channel.send("My prefix here is: " + prefix)
        DB.set(message.guild.id, args[0])
        return message.channel.send("Set the server prefix to: " + args[0])
    }
})