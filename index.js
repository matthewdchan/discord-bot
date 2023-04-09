// Require the necessary discord.js classes
require('dotenv').config();
const { REST, Routes } = require('discord.js');
const { Client, Collection, Events, GatewayIntentBits} = require('discord.js');
//const { token } = require('./config.json');
const { Player } = require('discord-player');


// handling node file reading
const fs = require('node:fs');
const path = require('node:path');

// Create a new client instance
const client = new Client({ intents: [
	GatewayIntentBits.Guilds, 
	GatewayIntentBits.GuildVoiceStates,
	GatewayIntentBits.MessageContent,
	GatewayIntentBits.GuildMembers,
	 ] });

// creating a commands property for client
const commands = [];
client.commands = new Collection();

// handling command loading
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// loop through all files in command directory
for (const file of commandFiles) {
	// create proper file path
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
		commands.push(command.data.toJSON());
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

client.player = new Player(client, {
	ytdlOptions: { 
		filter: 'audioonly',
		quality: 'highestaudio',
		highWaterMark: 1 << 25
	}
});
const player = client.player;

//player.events.on('playerStart', (queue, track) =>  {
//	queue.metadata.channel.send(`Now playing ${track.title}...`); 
//});

//globally register all commands with every server
client.on("ready", () => {
    // Get all ids of the servers
    const guild_ids = client.guilds.cache.map(guild => guild.id);


    const rest = new REST({version: '9'}).setToken(process.env.TOKEN);
    for (const guildId of guild_ids)
    {
        rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId), 
            {body: commands})
        .then(() => console.log('Successfully updated commands for guild ' + guildId))
        .catch(console.error);
    }
});

// event listener for all commands
client.on(Events.InteractionCreate, async interaction => {
	//if (!interaction.isChatInputCommand()) return;
	console.log(interaction)
	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(client, interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});



// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

// Log in to Discord with your client's token
client.login(process.env.TOKEN);