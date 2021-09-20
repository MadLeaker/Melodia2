const Command = require("../structs/Command");
const DB = require("quick.db")
module.exports = new Command({
    name: "3d",
    aliases: [`bassboost`, `echo`, `karaoke`, `nightcore`, `vaporwave`],
    description: "Sets a filter to the queue",
    dmOnly: false,
    async run(message, args, client) {
        let filter = client.distube.setFilter(message, command);
        message.channel.send("Current queue filter: " + (filter || "Off"));
    }
})