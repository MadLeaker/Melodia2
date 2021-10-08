const Command = require("../structs/Command");
const DB = require("quick.db")
const ffmpegFilters = {
    
}
module.exports = new Command({
    name: "effect",
    aliases: ["e"],
    description: "Sets a filter to the queue",
    dmOnly: false,
    async run(message, args, client) {
        let names = Object.keys(ffmpegFilters)
        let moreNames = Object.keys(client.effects)
        let combined = [...names, ...moreNames]
        if(combined.includes(args[0])) {
            let filter = client.distube.setFilter(message, args[0]);
            message.channel.send(`Current queue effect: \`${(filter || "Off")}\``);
        }
        else {
            message.channel.send(`This effect doesn't exist!\nThe current available effects: \`${combined.join(", ")}\``);
        }
        
    }
})