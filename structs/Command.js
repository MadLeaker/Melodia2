const Discord = require("discord.js")
const MelodiaClient = require("./MelodiaClient")

/**
 * 
 * @param {Discord.Message} message 
 * @param {string[]} args 
 * @param {MelodiaClient} client 
 */
function RunFunction(message, args, client) {

}

class Command {
    /**
     * @typedef {{name: string, description: string, run: RunFunction, dmOnly: boolean, aliases?: string[]}} CommandOptions
     * @param {CommandOptions} opts 
     */
    constructor(opts) {
        this.name = opts.name
        this.description = opts.description
        this.run = opts.run
        this.dmOnly = opts.dmOnly
        this.aliases = opts.aliases
    }
}

module.exports = Command