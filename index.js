const { RepeatMode } = require("distube");
const DB = require("quick.db")

// DisTube example bot, definitions, properties and events details in the Documentation page.
require("dotenv").config()
const Discord = require('discord.js'),
    DisTube = require('distube'),
    client = new Discord.Client({intents: ["GUILDS", "GUILD_VOICE_STATES", "GUILD_MESSAGES"]}),
    config = {
        prefix: process.env.PREFIX || "[]",
        token: process.env.TOKEN || "Bitch no token here!"
    };

// Create a new DisTube
const distube = new DisTube(client, {emitNewSongOnly: true, searchSongs: true, leaveOnStop: false, leaveOnFinish: false, leaveOnEmpty: true})

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity("Music!", {type: "PLAYING"})
});

client.on("message", async (message) => {
    let prefix = DB.get(message.guild.id) || config.prefix
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if(command == "prefix") {
        if(!args[0]) return message.channel.send("My prefix here is: " + prefix)
        DB.set(message.guild.id, args[0])
        return message.channel.send("Set the server prefix to: " + args[0])
    }


    if (["play", "p"].includes(command))
    {
        distube.play(message, args.join(" "));
    }

    if (["repeat", "loop", "r", "l"].includes(command)) {
        let queue = distube.getQueue(message)
        if(!queue) return message.channel.send("Nothing in queue!")
        let repeatMode = distube.setRepeatMode(message, 1)
        if(repeatMode == 1) {
            return message.channel.send("Repeating current song!")
        }
        else {
            return message.channel.send("Stopped repeating current song!")
        }
    }
    if (["queuerepeat", "queueloop", "qr", "ql"].includes(command)) {
        let queue = distube.getQueue(message)
        if(!queue) return message.channel.send("Nothing in queue!")
        let repeatMode = distube.setRepeatMode(message, 2)
        if(repeatMode == 2) {
            return message.channel.send("Repeating current queue!")
        }
        else {
            return message.channel.send("Stopped repeating current queue!")
        }
    }

    if(command == "seek") {
        let queue = distube.getQueue(message)
        if(!queue) return message.channel.send("Nothing in queue!")
        let curSong = queue.songs[0]
        if(!curSong) {
            return message.channel.send("Nothing in queue!")
        }
        if(args[0] < 0 || args[0] > curSong.duration) {
            return message.channel.send("Can't seek longer than the duration of the song or shorter than 0!")
        }
        distube.seek(message, args[0])
    }

    if (command == "stop") {
        let queue = distube.getQueue(message)
        if(!queue) {
            return message.channel.send("No songs in queue!")
        }
        distube.stop(message);
        message.channel.send("Stopped the music!");
    }

    if (command == "skip") {
        const queue = distube.getQueue(message)
        queue.autoplay = false
        if(!queue || queue.songs.length <= 0) return message.channel.send("Nothing in queue!")
        try {
            await distube.skip(message)
        } catch (e) {
            distube.stop(message)
        }
        message.channel.send("Skipped!")
    }
        

    if (["q", "queue"].includes(command)) {
        let queue = distube.getQueue(message);
        if(!queue) return message.channel.send("No songs in queue!")
        message.channel.send('Current queue:\n' + queue.songs.map((song, id) => {
            if(id == 0) return `**Currently playing**: ${song.name} - \`${song.formattedDuration}\``
            return `**${id}**. ${song.name} - \`${song.formattedDuration}\``
        }).join("\n"));
    }

    if ([`3d`, `bassboost`, `echo`, `karaoke`, `nightcore`, `vaporwave`].includes(command)) {
        let filter = distube.setFilter(message, command);
        message.channel.send("Current queue filter: " + (filter || "Off"));
    }

    if(command == "clear") {
        let queue = distube.getQueue(message)
        if(!queue || !queue.filters || queue.filters.length == 0) return message.channel.send("No filters in the queue!");
        distube.setFilter(message, false);
        message.channel.send("Cleared all filters");
    }
    if(command == "qc") {
        let queue = distube.getQueue(message)
        if(!queue) return message.channel.send("No songs in the queue!");
        queue.songs.splice(1, queue.songs.length - 1)
        message.channel.send("Cleared the queue!")
    }
    if(["d", "delete"].includes(command)) {
        let queue = distube.getQueue(message)
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
    if(command == "leave") {
       let queue = distube.getQueue(message)
       if(!queue.dispatcher) return message.channel.send("Not in a voice channel!")
       queue.dispatcher.end()
       message.channel.send("Successfully left the voice channel!")
    }
});

// Queue status template
const status = (queue) => `Volume: \`${queue.volume}%\` | Filter: \`${queue.filter || "Off"}\` | Loop: \`${queue.repeatMode ? queue.repeatMode == 2 ? "All Queue" : "This Song" : "Off"}\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\``;

// DisTube event listeners, more in the documentation page
distube
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
    // DisTubeOptions.searchSongs = true
    .on("searchResult", (message, result) => {
        let i = 0;
        message.channel.send(`**Choose an option from below**\n${result.map(song => `**${++i}**. ${song.name} - \`${song.formattedDuration}\``).join("\n")}\n*Enter anything else or wait 60 seconds to cancel*`);
    })
    // DisTubeOptions.searchSongs = true
    .on("searchCancel", (message) => message.channel.send(`Searching canceled`))
    .on("error", (msg, e) => {
        console.error(e)
	    msg.channel.send(`${e.name}`) // Discord limits 2000 characters in a message
    })

client.login(config.token);