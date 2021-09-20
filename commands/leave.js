const Command = require("../structs/Command")

module.exports = new Command({
    name: "leave",
    aliases: [],
    description: "Leaves the voice channel!",
    dmOnly: false,
    async run(message, args, client) {
        let queue = client.distube.getQueue(message)
       if(!queue.dispatcher) return message.channel.send("Not in a voice channel!")
       queue.dispatcher.end()
        message.guild.me.voice.channel.leave()
       message.channel.send("Successfully left the voice channel!")
    }
})
