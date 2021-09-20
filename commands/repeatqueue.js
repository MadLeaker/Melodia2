const Command = require("../structs/Command")
module.exports = new Command({
    name: "repeatqueue",
    aliases: ["ql", "qr", "qloop", "qrepeat"],
    description: "Sets the loop state (Queue / none)",
    dmOnly: false,
    async run(message, args, client) {
        let queue = client.distube.getQueue(message)
        if(!queue) return message.channel.send("Nothing in queue!")
        let repeatMode = client.distube.setRepeatMode(message, 2)
        if(repeatMode == 2) {
            return message.channel.send("Repeating current queue!")
        }
        else {
            return message.channel.send("Stopped repeating current queue!")
        }
    }
})