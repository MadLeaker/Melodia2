const Command = require("../structs/Command");
const Search = require("ytsr")
const EventEmitter = require("events")
const {MessageEmbed, Message} = require("discord.js")
const {MessageButton,MessageComponent, MessageActionRow, MessageButtonStyles} = require("discord-buttons")
/**
 * 
 * @param {Array} results 
 * @param {number} index 
 * @param {Message} message 
 */

const emitter = new EventEmitter()


/**
 * 
 * @param {*} results 
 * @param {number} index 
 * @param {number} prevIndex 
 * @param {Message} message 
 * @param {number} authorId 
 * @param {boolean} queueStatus 
 * @param {*} callback 
 * @returns 
 */
async function makeEmbed(results,index, message, authorId, queueStatus, callback) {
    const embed = new MessageEmbed()
    embed.setTitle(`[${index+1}/${results.length}] :`+results[index].title)
    embed.setThumbnail(results[index].bestThumbnail.url)
    embed.addField("Youtube URL", "https://youtu.be/"+results[index].id)
    embed.addField("Length", results[index].duration)
    embed.addField("Views", results[index].views.toLocaleString())
    embed.addField("Uploaded by", results[index].author.name)
    /**
     * @type {Message}
     */
    let msg;
    const row = new MessageActionRow()
    row.addComponent(new MessageButton().setID("play").setLabel(queueStatus ? "Add to queue" : "Play").setStyle(3))
    if(index == 0) {
        row.components.unshift(new MessageButton().setID("noPrev").setLabel("X").setStyle(4))
        row.addComponent(new MessageButton().setID("next").setLabel("Next").setStyle(1))
        msg = await message.edit(`**Choose the video you would like to play**\n**After a minute of inactivity / if you enter anything else, The search will be cancelled!**`, {embed: embed, components: [row]})
    }
    else {
        if(index == results.length - 1) {
            row.addComponent(new MessageButton().setID("noNext").setLabel("X").setStyle(4))

        }
        else {
            row.addComponent(new MessageButton().setID("next").setLabel("Next").setStyle(1))
        }
        row.components.unshift(new MessageButton().setID("prev").setLabel("Previous").setStyle(1))
        msg = await message.edit(`**Choose the video you would like to play**\n**After a minute of inactivity / if you enter anything else, The search will be cancelled!**`, {embed: embed, components: [row]})
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
    const msgFilter = (msg) => {
        if(msg.author.id == authorId) return true
    }
    let hasPressed = false
    try {
        let c1 = msg.channel.createMessageCollector(msgFilter, {max: 1, time: 60000, errors: ["time"]})
        let c2 = msg.createButtonCollector(filter, {maxButtons: 1, time: 60000, errors: ["time"]})
        c1.once("collect", async (c, r) => {
            hasPressed = true
            if(c) {
                c2.stop()
                await msg.channel.send("Cancelled the search!")
                await msg.delete()
                c1.stop()
                return
            }
        })
        c2.once("collect", async (c) => {
            hasPressed = true
            if(c.id == "prev" && index > 0) {
                await c.reply.defer()
                await makeEmbed(results, index-1, c.message, authorId, queueStatus, callback)
            }
            else if(c.id == "next") {
                await c.reply.defer()
                await makeEmbed(results, index+1, c.message,authorId,queueStatus, callback)
            }
            else if(c.id == "play") {
                await c.reply.defer()
                callback(index, c) 
            }
            c2.stop()
            c1.stop()
        })
        c2.once("end", async (c) => {
            if(!hasPressed) {
                c1.stop()
                await msg.channel.send("Due to inactivity, The search has been cancelled!")
                await msg.delete()
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
    name: "play",
    aliases: [
        "p"
    ],
    description: "Plays a song / adds to queue if a song is playing!",
    async run(msg, args, client) {
        if((!msg.guild.me.voice.channel && !msg.member.voice.channel) || (msg.guild.me.voice.channel && msg.guild.me.voice.channel != msg.member.voice.channel)) return msg.channel.send("Not in a voice channel! / Not in the same voice channel!")
        let queue = client.distube.getQueue(msg)

        if(!args[0].includes("https://www.youtube.com/watch?") && !args[0].includes("https://youtu.be/")) {
            msg.channel.send("Searching...").then(async m1 => {
                let searchedFilters = await Search.getFilters(args.join(" "))
                let onlyVideos = searchedFilters.get("Type").get("Video")
                let results = await Search(onlyVideos.url, {limit: 10})
                await makeEmbed(results.items, 0, m1,msg.author.id, queue !== undefined, async (index, c) => {
                    client.distube.play(msg, results.items[index].url)
                    c.message.delete()
                    let newMsg = await msg.channel.send("Processing...")
                    let msgs = client.messages.get(msg.author.id)
                    if(msgs) {
                        msgs.push({id: results.items[index].id, message: newMsg})
                        client.messages.set(msg.author.id, msgs)
                    }
                    else {
                        client.messages.set(msg.author.id, [{id: results.items[index].id, message: newMsg}])
                    }
                })
            })
           
        }
        else {
            let newMsg = await msg.channel.send("Processing...")
            let msgs = client.messages.get(msg.author.id)
            let vidId = args[0].slice(args[0].length-11, args[0].length)
            if(msgs) {
                    msgs.push({id: vidId, message: newMsg})
                    client.messages.set(msg.author.id, msgs)
            }
            else {
                client.messages.set(msg.author.id, [{id: vidId, message: newMsg}])
            }
            client.distube.play(msg, args[0])
        }
        
    }
})