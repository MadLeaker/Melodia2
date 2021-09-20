const Command = require("../structs/Command")
module.exports = new Command({
    name: "skip",
    aliases: ["s"],
    description: "Skips the current playing song!",
    dmOnly: false,
    async run(message, args, client) {
        const queue = client.distube.getQueue(message)
        queue.autoplay = false
        if(!queue || queue.songs.length <= 0) return message.channel.send("Nothing in queue!")
        try {
            await client.distube.skip(message)
        } catch (e) {
            client.distube.stop(message)
        }
        message.channel.send("Skipped!")
    }
})
