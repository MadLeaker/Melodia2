const Command = require("../structs/Command");
const DB = require("quick.db")
module.exports = new Command({
    name: "songdelete",
    aliases: ["delete", "d"],
    description: "deletes a song from the queue",
    dmOnly: false,
    async run(message, args, client) {
        let queue = client.distube.getQueue(message)
        if(!queue) return message.channel.send("No songs in the queue!");
        let index = args[0]
        let songsClone = [...queue.songs]
        songsClone.shift()
        if(index < 1 || index > songsClone.length) {
            return message.channel.send("Song not found!")
        }
        let deleted = songsClone.splice(index-1, 1)[0]
        queue.songs = [queue.songs[0],...songsClone]
        if(deleted) return message.channel.send(`Deleted the song: \`${deleted.name} - ${deleted.formattedDuration}\` from the queue!`);
        
        message.channel.send("Error occured!");
    }
})