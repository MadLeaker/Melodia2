const Discord = require("discord.js")
const {Client, Collection, MessageEmbed} = Discord
const Command = require("./Command")
const Distube = require("distube")
const fs = require("fs")
const DB = require("quick.db")
const disbut = require("discord-buttons")
const config = {
    prefix: process.env.PREFIX || "!",
    token: process.env.TOKEN || "Bitch no token here!"
};


class MelodiaClient extends Client {
    constructor() {
        super()
        this.disbut = disbut(this)
        this.distube = new Distube(this, {emitNewSongOnly: true, leaveOnEmpty: true})
        this.on("ready", this.onReady)
        this.on("message", this.onMessage)
        /**
         * @type {Discord.Collection<string, Command>}
         */
         this.commands = new Collection()
         this.messages = new Collection()
         this.distube
    .on("playSong", async (msg, queue, song) => {
        let message = this.messages.get(msg.author.id).find(x => x.id == song.id)

        queue.autoplay = false
        const embed = new MessageEmbed()
        embed.setTitle(`Playing ${song.name}`)
        embed.setThumbnail(song.thumbnail)
        embed.addField("Author", song.info.videoDetails.author.name, true)
        embed.addField("URL", "https://youtu.be/"+song.id, true)
        embed.addField("Requested by", song.user.tag, true)
        embed.addField("Views", song.views.toLocaleString(), true)
        embed.addField("Duration", song.formattedDuration, true)
        if(message) await message.message.edit({content: "",embed: embed})
        else
            msg.channel.send({embed: embed})
        message = undefined
    })
    .on("addSong", async (msg, queue, song) => {
        let message = this.messages.get(msg.author.id).find(x => x.id == song.id)
        console.log(message)
        const embed = new MessageEmbed()
        embed.setTitle(`Added ${song.name} to the queue`)
        embed.setThumbnail(song.thumbnail)
        embed.addField("Author", song.info.videoDetails.author.name, true)
        embed.addField("URL", "https://youtu.be/"+song.id, true)
        embed.addField("Requested by", song.user.tag, true)
        embed.addField("Place", queue.songs.length, true)
        embed.addField("Views", song.views.toLocaleString(), true)
        embed.addField("Duration", song.formattedDuration, true)
        if(message) await message.message.edit({content: "", embed: embed})
        else
            msg.channel.send({embed: embed})
        message = undefined
    })
    .on("addList", (msg, queue, playlist) => msg.channel.send(
        `Added \`${playlist.name}\` playlist (${playlist.songs.length} songs) to queue\n${status(queue)}`
    ))
    .on("playList", (msg, queue, p) => {
        msg.channel.send(
            `Playing \`${p.name}\` playlist (${p.songs.length} songs)`)
    })
    .on("error", (msg, e) => {
        console.error(e)
	    msg.channel.send(`${e.name}: ${e.message}`) // Discord limits 2000 characters in a message
    })
    }
    status = (queue) => `Volume: \`${queue.volume}%\` | Filter: \`${queue.filter || "Off"}\` | Loop: \`${queue.repeatMode ? queue.repeatMode == 2 ? "All Queue" : "This Song" : "Off"}\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\``;
    /**
     * 
     * @param {Discord.Message} message
     */
    onMessage(message) {
        
        let prefix = DB.get(message.guild.id) || config.prefix
        if(!message.content.startsWith(prefix) || message.author.bot) return
        const args = message.content.substring(prefix.length).split(/ +/)
        const name = args.shift()
        let command = this.commands.find(x => {
            if(x.name == name) return x
            if(x.aliases && x.aliases.length > 0 && x.aliases.includes(name)) return x
        })
        if(!command) return message.channel.send(`\`${name}\` isn't a command!`)
        if(command.dmOnly) {
            if(message.channel.type === "dm") {
                command.run(message, args, this)
            }
        }
        else {
            if(message.channel.type === "text") {
                command.run(message, args, this)
            }
        }
    }
        

    onReady() {
        console.log(`Logged in as ${this.user.username}`)
        const files = fs.readdirSync("./commands").filter(f => f.endsWith(".js"))
        for(let i = 0; i < files.length; i++) {
            const command = require(`../commands/${files[i]}`)
            this.commands.set(command.name, command)
            console.log(`Init command ${command.name}`)
        }
        console.log("The prefix is: " + config.prefix)
    }
    
}
module.exports = MelodiaClient