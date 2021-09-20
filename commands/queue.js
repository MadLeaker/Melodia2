const Command = require("../structs/Command")
module.exports = new Command({
    name: "queue",
    aliases: ["q"],
    description: "Shows the current queue!",
    dmOnly: false,
    async run(message, args, client) {
        let queue = client.distube.getQueue(message);
        if(!queue) return message.channel.send("No songs in queue!")
        message.channel.send('Current queue:\n' + queue.songs.map((song, id) => {
            if(id == 0) return `**Currently playing**: ${song.name} - \`${song.formattedDuration}\``
            return `**${id}**. ${song.name} - \`${song.formattedDuration}\``
        }).join("\n"));
    }
})
