const Command = require("../structs/Command")
const {MessageButton, MessageActionRow} = require("discord-buttons")
const {MessageEmbed, Message} = require("discord.js")
const MelodiaClient = require("../structs/MelodiaClient");
const Duration = require("distube/src/duration")

/**
 * 
 * @param {MelodiaClient} client 
 * @param {number} index 
 * @param {Message} message 
 * @param {number} authorId 
 */
async function makeEmbed(client,index, message, authorId) {
    const embed = new MessageEmbed()
    const queue = client.distube.getQueue(message)
    embed.setThumbnail(queue.songs[index].thumbnail)
    embed.addField("Youtube URL", "https://youtu.be/"+queue.songs[index].id)
    embed.addField("Length", queue.songs[index].formattedDuration)
    embed.addField("Views", queue.songs[index].views.toLocaleString())
    embed.addField("Uploaded by", queue.songs[index].info.videoDetails.author.name)
    embed.addField("Effect", queue.filter ? queue.filter : "None")
    switch(queue.repeatMode) {
        case 0:
            embed.addField("Loop Mode", "Disabled")
            break
        case 1:
            embed.addField("Loop Mode", `Looping ${queue.songs[0].name}`)
            break
        case 2:
            embed.addField("Loop Mode", `Looping entire queue`)
            break
    }
    /**
     * @type {Message}
     */
    let msg;
    const row = new MessageActionRow()
    if(index < queue.songs.length - 1) {
        row.addComponent(new MessageButton().setID("next").setLabel("Next").setStyle(1))
    }
    if(index == 0) {
    
        embed.addField("Time remaining", Duration.formatDuration((queue.songs[index].duration*1000)-(queue.currentTime)))
        embed.setTitle(`Currently playing: ${queue.songs[index].name}`)
        if(row.components.length > 0)
            msg = await message.edit(`**Here is the current queue**`, {embed: embed, components: [row]})
        else
            msg = await message.edit(`**Here is the current queue**`, {embed: embed})
    }
    else {
        let timeUntil = (queue.songs[0].duration*1000) - queue.currentTime
        for(let i = 1; i < index; i++) {
            timeUntil += queue.songs[i].duration*1000
        }
        embed.addField("Time remaining", Duration.formatDuration(timeUntil))
        embed.setTitle(`${index+1}/${queue.songs.length}: ${queue.songs[index].name}`)
        row.addComponent(new MessageButton().setID("remove").setLabel("Remove").setStyle(4))
        row.components.unshift(new MessageButton().setID("prev").setLabel("Previous").setStyle(1))
        msg = await message.edit(`**Here is the current queue**`, {embed: embed, components: [row]})
    }
    
    
    /**
     * 
     * @param {MessageComponent} button 
     * @returns 
     */
    const filter = (button) => {
        if(button.clicker.id == authorId) return true
        else {
            button.reply.send("You are not the chosen one!", {ephemeral: true})
        }
    }
    let hasPressed = false
    try {
        let c2 = msg.createButtonCollector(filter, {maxButtons: 1, time: 60000, errors: ["time"]})
        c2.once("collect", async (c) => {
            hasPressed = true
            if(c.id == "prev" && index > 0) {
                await c.reply.defer()
                await makeEmbed(client, index-1, c.message, authorId)
            }
            else if(c.id == "next") {
                await c.reply.defer()
                await makeEmbed(client, index+1, c.message,authorId)
            }
            else if(c.id == "remove") {
                let deleted = queue.songs.splice(index, 1)[0]
                await c.message.edit({components: []})
                await c.reply.send(`Removed \`${deleted.name}\` from the queue!`)
                await makeEmbed(client, index-1, c.message, authorId)
            }
            c2.stop()
        })
        c2.once("end", async (c) => {
            if(!hasPressed) {
                
                await msg.channel.send("Due to inactivity, The message has been deleted!")
                if(msg) {
                    await msg.delete()
                }
            } 
        })
    }
    catch(e) {
        console.log(e)
        await msg.channel.send("Due to inactivity, the message has been deleted!")
        await msg.delete()
    }
    
}


module.exports = new Command({
    name: "queue",
    aliases: ["q"],
    description: "Shows the current queue!",
    dmOnly: false,
    async run(message, args, client) {
        let queue = client.distube.getQueue(message);
        if(!queue) return message.channel.send("No songs in queue!")
        message.channel.send("Getting queue...").then(async msg => {
            await makeEmbed(client, 0, msg, message.author.id)
        })
    }
})
