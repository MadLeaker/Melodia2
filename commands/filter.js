const Command = require("../structs/Command");
const DB = require("quick.db")
const ffmpegFilters = {
    "3d": "apulsator=hz=0.125",
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
    earwax: "earwax",
}
module.exports = new Command({
    name: "effect",
    aliases: ["e"],
    description: "Sets a filter to the queue",
    dmOnly: false,
    async run(message, args, client) {
        let names = Object.keys(ffmpegFilters)
        if(names.includes(args[0])) {
            let filter = client.distube.setFilter(message, args[0]);
            message.channel.send(`Current queue effect: \`${(filter || "Off")}\``);
        }
        else {
            message.channel.send(`This effect doesn't exist!\nThe current available effects: \`${names.join(", ")}\``);
        }
        
    }
})