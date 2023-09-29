const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('clearconsole')
		.setDescription('Clears the bot\'s console'),
		
	args: [],
    permissions: [],

	async execute(interaction) { 
        const config = require('../config.json')
        if(!interaction.user.id == config.owner) {
            interaction.reply({ content: 'Must be naag to use this command', ephemeral: true})
            console.log(`${interaction.user.username}#${interaction.user.discriminator} attempted to clear the console`)
            return;

        };
        console.clear()
	},
};