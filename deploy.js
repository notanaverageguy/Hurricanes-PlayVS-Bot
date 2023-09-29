const { SlashCommandBuilder, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { clientID, devGuildID, token } = require('./config.json');
const fs = require('fs')

// Global Commands
const commandsPath = `${__dirname}/commands`;
const commandFiles = fs.readdirSync(commandsPath).filter(file => ['.js', '.ts'].some(char => file.endsWith(char)));

var commands = [];
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data)
}


// Development commands
var developmentPath = `${__dirname}/development commands`;
const developmentFiles = fs.readdirSync(developmentPath).filter(file => ['.js', '.ts'].some(char => file.endsWith(char)));

var development = [];
for(const file of developmentFiles) {
	const command = require(`./development commands/${file}`);
	development.push(command.data)
}


const rest = new REST({ version: '10' }).setToken(token);

rest.put(Routes.applicationCommands(clientID), { body: commands })
	.then(() => console.log(`Successfully registered application commands for ${__dirname.split('\\').pop()}`))
	.catch(console.error);

rest.put(Routes.applicationGuildCommands(clientID, devGuildID), { body: development })
	.then(() => console.log(`Successfully registered development commands for ${__dirname.split('\\').pop()}`))
	.catch(console.error);