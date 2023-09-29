const fs = require('fs');
const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js')

//------------------------------------------------------------------------------------------ Basic Necessities
const config = require(`${__dirname}/config.json`)	
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessages] });

//------------------------------------------------------------------------------------------ Command Handler

client.commands = new Map();
const commandsPath = `${__dirname}/commands`;
const commandFiles = fs.readdirSync(commandsPath).filter(file => ['.js', '.ts'].some(char => file.endsWith(char)));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

// ------------------------------------------------------------------------------------------ Development Command Handler

const developmentPath = `${__dirname}/development commands`;
const developmentFiles = fs.readdirSync(developmentPath).filter(file => ['.js', '.ts'].some(char => file.endsWith(char)));

for (const file of developmentFiles) {
	const command = require(`./development commands/${file}`);
	client.commands.set(command.data.name, command);
}

//------------------------------------------------------------------------------------------ Event Handler
const eventsPath = `${__dirname}/events`
const eventFiles = fs.readdirSync(eventsPath).filter(file => ['.js', '.ts'].some(char => file.endsWith(char)));

for (const file of eventFiles) {
	const filePath = `${eventsPath}/${file}`
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args, connection));
	}
}

//------------------------------------------------------------------------------------------ Command Parser
client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		// Making sure they have permissions
		if(command.permissions > 0) {
			var botPerms = new PermissionsBitField(interaction.guild.members.me.permissions);
			var userPerms = new PermissionsBitField(interaction.memberPermissions);

			if(!botPerms.has(command.permissions)) {
				return await interaction.reply({ content: 'Bot is missing permissions for this', ephemeral: true });
			}
			if(!userPerms.has(command.permissions)) {
				return await interaction.reply({ content: 'User is missing permissions for this', ephemeral: true });
			}
		}

		// Pushing Correct Args
		if(command.args.length > 0) {
			var args = [];

			command.args.forEach( arg => {
				if(arg == "client") args.push(client)
				if(arg == "owner") args.push(config.owner)
			})
			if(args.length == 1) { args = args[0]}
			await command.execute(interaction, args);

		} else {
			await command.execute(interaction);
		}


	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.login(config.token);