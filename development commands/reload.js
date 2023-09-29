const { SlashCommandBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reload')
		.setDescription('Reloads the bot'),

	args: ["client", "dir"],

	async execute(interaction, args) {
		const config = require('../config.json')
		if(!interaction.user.id == config.owner) {
				interaction.reply({ content: 'Must be naag to use this command', ephemeral: true})
				console.log(`${interaction.user.username}#${interaction.user.discriminator} attempted to reload the bot`)
				return;
			};

			try{		
				//Normal Commands
				const commandsPath = `./commands`;
				const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

				for (const file of commandFiles) {
					delete require.cache[require.resolve(`../commands/${file}`)]
					const command = require(`../commands/${file}`);
					args[0].commands.set(command.data.name, command);
				}
				console.log(`${args[1].split('\\').pop()}'s commands reloaded correctly`)

				//Development Commands

				const developmentPath = `${args[1]}/development commands`
				const developmentFiles = fs.readdirSync(developmentPath).filter(file => file.endsWith('.js'));

				for (const file of developmentFiles) {
					delete require.cache[require.resolve(`${args[1]}/development commands/${file}`)]
					const command = require(`../development commands/${file}`);
					args[0].commands.set(command.data.name, command);
				}
				console.log(`${args[1].split('\\').pop()}'s development commands reloaded correctly`)


				interaction.reply({ content: 'Bot successfully loaded', ephemeral: true});
			} catch (e){
				console.log(e);
				interaction.reply({ content: 'Error reloading bot', ephemeral: true});
			}
	},
};