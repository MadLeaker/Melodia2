const Command = require("../structs/Command")
module.exports = new Command({
    name: "seek",
    aliases: [],
    description: "Seeks to a location within song duration",
    dmOnly: false,
    async run(message, args, client) {
        let queue = client.distube.getQueue(message)
        if(!queue) return message.channel.send("Nothing in queue!")
        let curSong = queue.songs[0]
        if(!curSong) {
            return message.channel.send("Nothing in queue!")
        }
        if(args[0] < 0 || args[0] > curSong.duration) {
            return message.channel.send("Can't seek longer than the duration of the song or shorter than 0!")
        }
        client.distube.seek(message, args[0])
    }
})