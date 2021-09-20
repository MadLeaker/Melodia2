const Command = require("../structs/Command");
const DB = require("quick.db")
module.exports = new Command({
    name: "prefix",
    aliases: ["pf", "pre"],
    description: "Shows prefix / sets it!",
    dmOnly: false,
    async run(message, args, client) {
        if(!args[0]) return message.channel.send("My prefix here is: " + prefix)
        DB.set(message.guild.id, args[0])
        return message.channel.send("Set the server prefix to: " + args[0])
    }
})