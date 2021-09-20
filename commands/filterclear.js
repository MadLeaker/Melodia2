const Command = require("../structs/Command");
const DB = require("quick.db")
module.exports = new Command({
    name: "clear",
    aliases: [],
    description: "Cleans the filters",
    dmOnly: false,
    async run(message, args, client) {
        let queue = client.distube.getQueue(message)
        if(!queue || !queue.filters || queue.filters.length == 0) return message.channel.send("No filters in the queue!");
        client.distube.setFilter(message, false);
        message.channel.send("Cleared all filters");
    }
})