const Command = require("../structs/Command")
module.exports = new Command({
    name: "seek",
    aliases: [],
    description: "Seeks to a location within song duration",
    dmOnly: false,
    async run(message, args, client) {
        var toHHMMSS = (secs) => {
            var sec_num = parseInt(secs, 10)
            var hours   = Math.floor(sec_num / 3600)
            var minutes = Math.floor(sec_num / 60) % 60
            var seconds = sec_num % 60
        
            return [hours,minutes,seconds]
                .map(v => v < 10 ? "0" + v : v)
                .filter((v,i) => v !== "00" || i > 0)
                .join(":")
        }

        let queue = client.distube.getQueue(message)
        if(!queue) return message.channel.send("Nothing in queue!")
        let curSong = queue.songs[0]
        if(!curSong) {
            return message.channel.send("Nothing in queue!")
        }
        if(args[0] < 0 || args[0] > curSong.duration) {
            return message.channel.send("Can't seek longer than the duration of the song or shorter than 0!")
        }
        
        client.distube.seek(message, Number(args[0])*1000)
        message.channel.send("Successfully seeked to: " + toHHMMSS(args[0]))
    }
})