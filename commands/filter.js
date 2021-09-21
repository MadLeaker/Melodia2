const Command = require("../structs/Command");
const DB = require("quick.db")
module.exports = new Command({
    name: "filter",
    aliases: ["f"],
    description: "Sets a filter to the queue",
    dmOnly: false,
    async run(message, args, client) {
        let possible = [`bassboost`, `echo`, `karaoke`, `nightcore`, `vaporwave`, "3d"]
        if(possible.includes(args[0])) {
            let filter = client.distube.setFilter(message, args[0]);
            message.channel.send("Current queue filter: " + (filter || "Off"));
        }
        else {
            message.channel.send("This filter doesn't exist!");
        }
        
    }
})