const Command = require("../structs/Command");
const Search = require("ytsr")
const {MessageEmbed, Message} = require("discord.js")
const {MessageButton, MessageActionRow, MessageButtonStyles} = require("discord-buttons")
/**
 * 
 * @param {Array} results 
 * @param {number} index 
 * @param {Message} message 
 */

async function makeEmbed(results,index, prevIndex, message, authorId, callback) {
    const embed = new MessageEmbed()
    embed.setTitle(`[${index+1}/${results.length}] :`+results[index].title)
    embed.setThumbnail(results[index].bestThumbnail.url)
    embed.addField("Youtube ID", results[index].id)
    embed.addField("Length", results[index].duration)
    embed.addField("Views", results[index].views)
    embed.addField("Uploaded by", results[index].author.name)
    let msg;
    const row = new MessageActionRow()
    row.addComponent(new MessageButton().setID("play").setLabel("Play").setStyle(3))
    row.addComponent(new MessageButton().setID("next").setLabel("Next").setStyle(1))
    if(index == 0) {
        row.components.unshift(new MessageButton().setID("noPrev").setLabel("X").setStyle(4))
        if(prevIndex == 0) {
            msg = await message.channel.send(`**Choose the video you would like to play**`, {embed: embed, components: [row]})
        }
        else {
            msg = await message.edit(`**Choose the video you would like to play**`, {embed: embed, components: [row]})
        }
    }
    else {
        row.components.unshift(new MessageButton().setID("prev").setLabel("Previous").setStyle(1))
        msg = await message.edit(`**Choose the video you would like to play**`, {embed: embed, components: [row]})
    }
    const filter = (button) => {
        if(button.clicker.id == authorId) return true
    }
    let collected = await msg.awaitButtons(filter, {maxButtons: 1, time: 60000})
    let c = collected.first()
        if(c.id == "prev" && index > 0) {
            await c.reply.defer()
            await makeEmbed(results, index-1, index, c.message, authorId, callback)
        }
        else if(c.id == "next") {
            await c.reply.defer()
            await makeEmbed(results, index+1, index, c.message,authorId, callback)
        }
        else if(c.id == "play") {
            await c.reply.defer()
            callback(index, c) 
        }
}


module.exports = new Command({
    name: "play",
    aliases: [
        "p"
    ],
    description: "Plays a song / adds to queue if a song is playing!",
    async run(msg, args, client) {
        let onlyVideos = await (await Search.getFilters(args.join(" "))).get("Type").get("Video")
        let results = await Search(onlyVideos.url, {limit: 10})
        await makeEmbed(results.items, 0, 0, msg,msg.author.id, async (index, c) => {
            client.distube.play(msg, results.items[index].url)
            c.message.delete()
        })
    }
})