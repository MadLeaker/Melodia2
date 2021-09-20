const Command = require("../structs/Command");
const DB = require("quick.db")
module.exports = new Command({
    name: "queueclear",
    aliases: ["qc"],
    description: "Cleans the queue",
    dmOnly: false,
    async run(message, args, client) {
        let queue = client.distube.getQueue(message)
        if(!queue) return message.channel.send("No songs in the queue!");
        queue.songs.splice(1, queue.songs.length - 1)
        message.channel.send("Cleared the queue!")
    }
})