const { Client, IntentsBitField, ChannelType } = require("discord.js");
const path = require('node:path');
require('dotenv').config()
const fs = require('node:fs');
const { createAudioResource, joinVoiceChannel, AudioPlayerStatus, createAudioPlayer } = require('@discordjs/voice');

const intents = new IntentsBitField();
intents.add(IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildVoiceStates);
const client = new Client({
    intents: intents,
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
})

init = () => {
    player = createAudioPlayer();
    client.guilds.cache.get(process.env.GUILD_ID).fetch().then(guild => {
        joinAndPlayIntervall(guild, player);
    })
}

joinAndPlayIntervall = (guild, player) => {
    maxChannel = guild.channels.cache.filter(channel => {
        return channel.type == ChannelType.GuildVoice
    }).reduce((prev, curr) => {
        return prev.members.size > curr.members.size ? prev : curr 
    })
    if (maxChannel.members.size == 0) {
        setTimeout(() => joinAndPlayIntervall(guild, player), getTimeDelay() )
        return
    }
    var con = joinVoiceChannel({
        channelId: maxChannel.id,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
        selfMute: false,
        selfDeaf: false
    })
    con.subscribe(player)
    player.play(createAudioResource(getRandomFile()))
    player.once(AudioPlayerStatus.Idle, () => {
        player.stop();
        con.destroy();
    })
    setTimeout(() => joinAndPlayIntervall(guild, player), getTimeDelay() )
}

getTimeDelay = () => {
    baseTime = 2 * 60 * 60 * 1000;
    offsetRange = 15 * 60 * 1000
    return baseTime - offsetRange / 2 + offsetRange * Math.random() 
}

getRandomFile = () => {
    filesChances = [
        {file: "butzbach", chance: 0.0},
        {file: "mutter", chance: 0.8},
        {file: "kopftuch", chance: 0.9},
        {file: "gangstah", chance: 0.97}
    ].reverse()
    randomNum = Math.random()
    file = filesChances.find(file => randomNum > file.chance )
    return path.join('res', `${file.file}.mp3`)
}

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`)
    client.user.setPresence({
        activities: [{
            name: 'Mutter im Knast heute zu Besuch'
        }]
    })
    init()
})
client.login(process.env.TOKEN)