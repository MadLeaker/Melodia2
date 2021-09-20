const { RepeatMode } = require("distube");
const DB = require("quick.db");
const MelodiaClient = require("./structs/MelodiaClient");

// DisTube example bot, definitions, properties and events details in the Documentation page.
require("dotenv").config()
const Discord = require('discord.js'),
    DisTube = require('distube'),
    client = new MelodiaClient()

client.login(process.env.TOKEN);