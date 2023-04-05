// Require the necessary discord.js classes
const { Client, Collection, Events, GatewayIntentBits, IntentsBitField } = require('discord.js');
const { token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

// creates a list of intents for client
const myItents = new IntentsBitField();
myItents.add(IntentsBitField.Flags.GuildPresences, IntentsBitField.Flags.GuildMembers);

// Create a new client instance
const client = new Client({ intents: myItents });

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

// event listener for all commands
client.on(Events.InteractionCreate, async interaction => {
	// ensures command is only a slash command
	if (!interaction.isChatInputCommand()) return;
	console.log(interaction);
	// creating command object
	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try { // attempt to execute command
		await command.execute(interaction);
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
client.login(token);