const { SlashCommandBuilder } = require("@discordjs/builders")
//const { useMasterPlayer } = require("discord-player");
//const player = useMasterPlayer();

module.exports = {
	data: new SlashCommandBuilder()
        .setName("pause")
        .setDescription("Pauses the current song"),
	execute: async ( client, interaction ) => {
        // Get the queue for the server
		
		//const queue = await client.player.getQueue(interaction.guildId)
		const queue =  client.player.nodes.get(interaction.guild.id);
        // Check if the queue is empty
		if (!queue)
		{
			await interaction.reply("There are no songs in the queue")
			return;
		}

        // Pause the current song
		const paused = queue.node.pause();
		if (paused) {
        await interaction.reply("Player has been paused.")
	}
}
}