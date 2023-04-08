const { SlashCommandBuilder } = require("@discordjs/builders")
const { useMasterPlayer } = require("discord-player");
const player = useMasterPlayer();

module.exports = {
	data: new SlashCommandBuilder()
        .setName("resume")
        .setDescription("Resumes the current song"),
	execute: async ({ player, interaction }) => {
        // Get the queue for the server
		const queue = player.getQueue(interaction.guildId)

        // Check if the queue is empty
		if (!queue)
        {
            await interaction.reply("No songs in the queue");
            return;
        }

        // Pause the current song
		queue.setPaused(false);

        await interaction.reply("Player has been resumed.")
	},
}