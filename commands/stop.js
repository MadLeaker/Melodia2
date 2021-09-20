const Command = require("../structs/Command")
module.exports = new Command({
    name: "stop",
    aliases: [],
    description: "Shows prefix / sets it!",
    dmOnly: false,
    async run(message, args, client) {
        let queue = client.distube.getQueue(message)
        if(!queue) {
            return message.channel.send("No songs in queue!")
        }
        client.distube.stop(message);
        message.channel.send("Stopped the music!");
    }
})
