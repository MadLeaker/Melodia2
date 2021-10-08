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

const bass = (g) => `bass=g=${g}:f=110:w=0.3`;



const FilterList = {
    bassboost_low: bass(15),
    bassboost2: bass(20),
    bassboost_high: bass(30),
    "8D": "apulsator=hz=0.09",
    vaporwave2: "aresample=48000,asetrate=48000*0.8",
    nightcore2: "aresample=48000,asetrate=48000*1.25",
    phaser: "aphaser=in_gain=0.4",
    tremolo: "tremolo",
    vibrato: "vibrato=f=6.5",
    reverse: "areverse",
    treble: "treble=g=5",
    normalizer: "dynaudnorm=g=101",
    normalizer2: "acompressor",
    pulsator: "apulsator=hz=1",
    subboost: "asubboost",
    karaoke: "stereotools=mlev=0.03",
    mono: "pan=mono|c0=.5*c0+.5*c1",
    mstlr: "stereotools=mode=ms>lr",
    mstrr: "stereotools=mode=ms>rr",
    compressor: "compand=points=-80/-105|-62/-80|-15.4/-15.4|0/-12|20/-7.6",
    expander: "compand=attacks=0:points=-80/-169|-54/-80|-49.5/-64.6|-41.1/-41.1|-25.8/-15|-10.8/-4.5|0/0|20/8.3",
    softlimiter: "compand=attacks=0:points=-80/-80|-12.4/-12.4|-6/-8|0/-6.8|20/-2.8",
    chorus: "chorus=0.7:0.9:55:0.4:0.25:2",
    chorus2d: "chorus=0.6:0.9:50|60:0.4|0.32:0.25|0.4:2|1.3",
    chorus3d: "chorus=0.5:0.9:50|60|40:0.4|0.32|0.3:0.25|0.4|0.3:2|2.3|1.3",
    fadein: "afade=t=in:ss=0:d=10",
    dim: `afftfilt="'real=re * (1-clip((b/nb)*b,0,1))':imag='im * (1-clip((b/nb)*b,0,1))'"`,
    earrape: "channelsplit,sidechaingate=level_in=64", "3d": "apulsator=hz=0.125",
    bassboost: "bass=g=10,dynaudnorm=f=150:g=15",
    echo: "aecho=0.8:0.9:1000:0.3",
    flanger: "flanger",
    gate: "agate",
    haas: "haas",
    karaoke: "stereotools=mlev=0.1",
    nightcore: "asetrate=48000*1.25,aresample=48000,bass=g=5",
    reverse: "areverse",
    vaporwave: "asetrate=48000*0.8,aresample=48000,atempo=1.1",
    mcompand: "mcompand",
    phaser: "aphaser",
    tremolo: "tremolo",
    surround: "surround",
    earwax: "earwax"}


class MelodiaClient extends Client {
    constructor() {
        super()
        this.disbut = disbut(this)
        this.effects = FilterList
        this.distube = new Distube(this, {emitNewSongOnly: true, leaveOnEmpty: true, customFilters: FilterList})
        this.on("ready", this.onReady)
        this.on("message", this.onMessage)
        /**
         * @type {Discord.Collection<string, Command>}
         */
         this.commands = new Collection()
         this.messages = new Collection()
         this.distube
         
    .on("playSong", async (msg, queue, song) => {
        let message = this.messages.get(msg.author.id).splice(0, 1)[0]

        queue.autoplay = false
        const embed = new MessageEmbed()
        embed.setTitle(`Playing ${song.name}`)
        embed.setThumbnail(song.thumbnail)
        embed.addField("Author", song.info.videoDetails.author.name, true)
        embed.addField("URL", "https://youtu.be/"+song.id, true)
        embed.addField("Requested by", song.user.tag, true)
        embed.addField("Views", song.views.toLocaleString(), true)
        embed.addField("Duration", song.formattedDuration, true)
        embed.addField("Effect", queue.filter ? queue.filter : "None", true)
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
        if(message) await message.edit({content: "",embed: embed})
        else
            msg.channel.send({embed: embed})
        
    })
    .on("addSong", async (msg, queue, song) => {
        let message = this.messages.get(msg.author.id).splice(0, 1)[0]
        const embed = new MessageEmbed()
        embed.setTitle(`Added ${song.name} to the queue`)
        embed.setThumbnail(song.thumbnail)
        embed.addField("Author", song.info.videoDetails.author.name, true)
        embed.addField("URL", "https://youtu.be/"+song.id, true)
        embed.addField("Requested by", song.user.tag, true)
        embed.addField("Place", queue.songs.length-1, true)
        embed.addField("Views", song.views.toLocaleString(), true)
        embed.addField("Duration", song.formattedDuration, true)
        embed.addField("Effect", queue.filter ? queue.filter : "None", true)
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
        if(message) await message.edit({content: "", embed: embed})
        else
            msg.channel.send({embed: embed})
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