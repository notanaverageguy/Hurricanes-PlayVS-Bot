const fs = require("fs");
const path = require("node:path");
const {
	Client,
	Collection,
	GatewayIntentBits,
	PermissionsBitField,
} = require("discord.js");

//------------------------------------------------------------------------------------------ Basic Necessities
const config = require(`${__dirname}/config.json`);
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessages,
	],
});

//------------------------------------------------------------------------------------------ Command Handler

client.commands = new Collection();
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs
		.readdirSync(commandsPath)
		.filter((file) =>
			[".js", ".ts"].some((extension) => file.endsWith(extension))
		);
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ("data" in command && "execute" in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(
				`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
			);
		}
	}
}

// ------------------------------------------------------------------------------------------ Development Command Handler

const developmentPath = `${__dirname}/development commands`;
const developmentFiles = fs
	.readdirSync(developmentPath)
	.filter((file) => [".js", ".ts"].some((char) => file.endsWith(char)));

for (const file of developmentFiles) {
	const command = require(`./development commands/${file}`);
	client.commands.set(command.data.name, command);
}

//------------------------------------------------------------------------------------------ Event Handler
const eventsPath = `${__dirname}/events`;
const eventFiles = fs
	.readdirSync(eventsPath)
	.filter((file) => [".js", ".ts"].some((char) => file.endsWith(char)));

for (const file of eventFiles) {
	const filePath = `${eventsPath}/${file}`;
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(client, ...args));
	}
}

//------------------------------------------------------------------------------------------ Command Parser
client.on("interactionCreate", async (interaction) => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		// Making sure they have permissions
		if (command.bot_permissions > 0) {
			var botPerms = new PermissionsBitField(
				interaction.guild.members.me.permissions
			);
			if (!botPerms.has(command.bot_permissions)) {
				return await interaction.reply({
					content: "Bot is missing permissions for this",
					ephemeral: true,
				});
			}
		}

		if(command.user_permissions > 0) {
			var userPerms = new PermissionsBitField(
				interaction.memberPermissions
			);

			if (!userPerms.has(command.user_permissions)) {
				return await interaction.reply({
					content: "User is missing permissions for this",
					ephemeral: true,
				});
			}
		}

		// Pushing Correct Args
		if (command.args.length > 0) {
			var args = [];

			command.args.forEach((arg) => {
				if (arg == "client") args.push(client);
				if (arg == "owner") args.push(config.owner);
			});
			if (args.length == 1) {
				args = args[0];
			}
			await command.execute(interaction, args);
		} else {
			await command.execute(interaction);
		}
	} catch (error) {
		console.error(error);
		await interaction.reply({
			content: "There was an error while executing this command!",
			ephemeral: true,
		});
	}
});

client.login(config.token);
