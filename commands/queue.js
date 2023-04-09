const { SlashCommandBuilder, EmbedBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")
//const { useMasterPlayer } = require("discord-player");
//const player = useMasterPlayer();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("queue")
        .setDescription("shows first 10 songs in the queue"),

    execute: async ( client, interaction ) => {
        const queue =  client.player.nodes.get(interaction.guild.id);
        
        // check if there are songs in the queue
        if (!queue || !queue.isPlaying())
        {
            await interaction.reply("There are no songs in the queue");
            return;
        }

        // Get the first 10 songs in the queue
        const tracks = queue.tracks.map((track, index) => `${++index}. ${track.title}`);
        let tracksQueue = '';
        tracksQueue = tracks.slice(0, 10).join('\n')
        //const queueString = queue.tracks.slice(0, 10).map((song, i) => {
           // return `${i}) [${song.duration}]\` ${song.title} - <@${song.requestedBy.id}>`
        //}).join("\n")

        // Get the current song
        const currentSong = queue.currentTrack

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(`**Currently Playing**\n` + 
                        (currentSong ? `\`[${currentSong.duration}]\` ${currentSong.title} - <@${currentSong.requestedBy.id}>` : "None") +
                        `\n\n**Queue**\n${tracksQueue}` // was queueString
                    )
                    .setThumbnail(currentSong.setThumbnail)
            ]
        })
    }
}