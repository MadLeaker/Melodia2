const Command = require("../structs/Command");
const Search = require("ytsr")
const {MessageEmbed, Message} = require("discord.js")
const disbut = require("discord-buttons")
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
    let reactions = [
        "✅",
        ]
    if(index == 0) {
        if(prevIndex == 0) {
            msg = await message.channel.send(`**Choose the video you would like to play**`, {embed: embed})
        }
        else {
            msg = await message.edit(`**Choose the video you would like to play**`, {embed: embed})
        }
        reactions.unshift("❌")
    }
    else {
        msg = await message.edit(`**Choose the video you would like to play**`, {embed: embed})
        reactions.unshift("⬅️")
    }
    if(index < results.length - 1) {
        reactions.push("➡️")
    }
    else {
        reactions.push("❌")
    }
    await msg.reactions.removeAll()
    for(let i = 0; i < reactions.length; i++) {
        await msg.react(reactions[i])
    }
    let collected = await msg.awaitReactions((r,u) => reactions.includes(r.emoji.name) && !u.bot && u.id == authorId, {max: 1, users: 1, time: 60000, errors: ["time"]})
    let c = collected.first()
        if(c.emoji.name == "⬅️" && index > 0) {
            await makeEmbed(results, index-1, index, msg, authorId, callback)
        }
        else if(c.emoji.name == "➡️") {

            await makeEmbed(results, index+1, index, msg,authorId, callback)
        }
        else if(c.emoji.name == "✅") {
            callback(index, msg) 
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
        await makeEmbed(results.items, 0, 0, msg,msg.author.id, async (index, msg1) => {
            client.distube.play(msg, results.items[index].url)
            msg1.delete()
        })
    }
})