// DisTube example bot, definitions, properties and events details in the Documentation page.
const Discord = require('discord.js'),
    DisTube = require('distube'),
    client = new Discord.Client({intents: ["GUILDS", "GUILD_VOICE_STATES", "GUILD_MESSAGES"]}),
    config = {
        prefix: "[]",
        token: process.env.TOKEN || "Bitch no token here!"
    };

// Create a new DisTube
const distube = new DisTube.default(client)
distube.options.searchSongs = 5

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(config.prefix)) return;
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (command == "play")
        distube.play(message, args.join(" "));

    if (["repeat", "loop"].includes(command))
        distube.setRepeatMode(message, parseInt(args[0]));

    if (command == "stop") {
        distube.stop(message);
        message.channel.send("Stopped the music!");
    }

    if (command == "skip") {
        const queue = distube.getQueue(message)
        if(!queue || queue.songs.length <= 0) return message.channel.send("Nothing in queue!")
        try {
            distube.skip(message)
            message.channel.send(`Skipped!`)
        } catch (e) {
            message.channel.send(`${e}`)
        }
    }
        

    if (command == "queue") {
        let queue = distube.getQueue(message);
        message.channel.send('Current queue:\n' + queue.songs.map((song, id) =>
            `**${id + 1}**. ${song.name} - \`${song.formattedDuration}\``
        ).slice(0, 10).join("\n"));
    }

    if ([`3d`, `bassboost`, `echo`, `karaoke`, `nightcore`, `vaporwave`].includes(command)) {
        let filter = distube.setFilter(message, command);
        message.channel.send("Current queue filter: " + (filter || "Off"));
    }
});

// Queue status template
const status = (queue) => `Volume: \`${queue.volume}%\` | Filter: \`${queue.filter || "Off"}\` | Loop: \`${queue.repeatMode ? queue.repeatMode == 2 ? "All Queue" : "This Song" : "Off"}\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\``;

// DisTube event listeners, more in the documentation page
distube
    .on("playSong", (queue, song) => {
        let msg = `Playing \`${song.name}\` - \`${song.formattedDuration}\``
        if (song.playlist) msg = `Playlist: ${song.playlist.name}\n${msg}`
        queue.textChannel.send(msg)
    })
    .on("addSong", (queue, song) => queue.textChannel.send(
        `Added ${song.name} - \`${song.formattedDuration}\` to the queue by ${song.user}`
    ))
    .on("addList", (queue, playlist) => queue.textChannel.send(
        `Added \`${playlist.name}\` playlist (${playlist.songs.length} songs) to queue\n${status(queue)}`
    ))
    // DisTubeOptions.searchSongs = true
    .on("searchResult", (message, result) => {
        let i = 0;
        message.channel.send(`**Choose an option from below**\n${result.map(song => `**${++i}**. ${song.name} - \`${song.formattedDuration}\``).join("\n")}\n*Enter anything else or wait 60 seconds to cancel*`);
    })
    // DisTubeOptions.searchSongs = true
    .on("searchCancel", (message) => message.channel.send(`Searching canceled`))
    .on("error", (channel, e) => {
        console.error(e)
	    channel.send(`An error encoutered: ${e.message.slice(0, 1979)}`) // Discord limits 2000 characters in a message
    });

client.login(config.token);