const { Routes } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { clientID, devGuildID, token } = require("./config.json");
const fs = require("fs");
const path = require("node:path");

// Global Commands
const commands = [];
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs
		.readdirSync(commandsPath)
		.filter((file) => file.endsWith(".js"));
	for (const file of commandFiles) {
		const command = require(`${commandsPath}/${file}`);
		commands.push(command.data);
	}
}

// Development commands
const development = [];
const developmentPath = path.join(__dirname, "development commands");
const developmentFolders = fs.readdirSync(developmentPath);

for (const folder of developmentFolders) {
	const commandsPath = path.join(developmentPath, folder);
	const commandFiles = fs
		.readdirSync(commandsPath)
		.filter((file) => file.endsWith(".js"));
	for (const file of commandFiles) {
		const command = require(`${commandsPath}/${file}`);
		development.push(command.data);
	}
}

const rest = new REST({ version: "10" }).setToken(token);

rest.put(Routes.applicationCommands(clientID), { body: commands })
	.then(() =>
		console.log(
			`Successfully registered application commands for ${__dirname
				.split("\\")
				.pop()}`
		)
	)
	.catch(console.error);

rest.put(Routes.applicationGuildCommands(clientID, devGuildID), {
	body: development,
})
	.then(() =>
		console.log(
			`Successfully registered development commands for ${__dirname
				.split("\\")
				.pop()}`
		)
	)
	.catch(console.error);
