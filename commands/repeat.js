const Command = require("../structs/Command")
module.exports = new Command({
    name: "repeat",
    aliases: ["l", "r", "loop"],
    description: "Sets the loop state (Song / none)",
    dmOnly: false,
    async run(message, args, client) {
        let queue = client.distube.getQueue(message)
        if(!queue) return message.channel.send("Nothing in queue!")
        let repeatMode = client.distube.setRepeatMode(message, 1)
        if(repeatMode == 1) {
            return message.channel.send("Repeating current song!")
        }
        else {
            return message.channel.send("Stopped repeating current song!")
        }
    }
})