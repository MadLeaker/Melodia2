const Command = require("../structs/Command");
const DB = require("quick.db")
const {promisify} = require("util")
module.exports = new Command({
    name: "effect",
    aliases: ["e"],
    description: "Sets a filter to the queue",
    dmOnly: false,
    async run(message, args, client) {
        let effects = Object.keys(client.effects)
        if(effects.includes(args[0])) {
            const setFilter = promisify(client.distube.setFilter)
            let filter = await setFilter(message, args[0]);
            message.channel.send(`Current queue effect: \`${(filter || "Off")}\``);
        }
        else {
            message.channel.send(`This effect doesn't exist!\nThe current available effects: \`${combined.join(", ")}\``);
        }
        
    }
})