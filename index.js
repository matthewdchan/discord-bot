// Require the necessary discord.js classes
const { Client, Collection, Events} = require('discord.js');
const { token } = require('./config.json');
const {REST} = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Player } = require('discord-player');

// handling node file reading
const fs = require('node:fs');
const path = require('node:path');

// Create a new client instance
const client = new Client({ intents: ["Guilds", "GuildMessages", "MessageContent", "GuildVoiceStates"] });

// creating a commands property for client

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
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

const player = Player.singleton(client);

// event listener for all commands
client.on(Events.InteractionCreate, async interaction => {
    if(!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if(!command) return;

    try
    {
        await command.execute({client, interaction});
    }
    catch(error)
    {
        console.error(error);
        await interaction.reply({content: "There was an error executing this command"});
    }
});



// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

// Log in to Discord with your client's token
client.login(token);