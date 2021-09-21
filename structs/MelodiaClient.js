const Discord = require("discord.js")
const {Client, Collection} = Discord
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
         this.distube
    .on("playSong", (msg, queue, song) => {
        queue.autoplay = false
        if(song) {
            let msg1 = `Playing \`${song.name}\` - \`${song.formattedDuration}\``
            msg.channel.send(msg1)
        }
        else {
            msg.channel.send("Nothing in queue!")
        }
        
    })
    .on("addSong", (msg, queue, song) => msg.channel.send(
        `Added \`${song.name} - ${song.formattedDuration}\` to the queue by ${song.user}`
    ))
    .on("addList", (msg, queue, playlist) => msg.channel.send(
        `Added \`${playlist.name}\` playlist (${playlist.songs.length} songs) to queue\n${status(queue)}`
    ))
    .on("playList", (msg, queue, p) => {
        msg.channel.send(
            `Playing \`${p.name}\` playlist (${p.songs.length} songs)`)
    })
    .on("error", (msg, e) => {
        console.error(e)
	    msg.channel.send(`${e.name}`) // Discord limits 2000 characters in a message
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