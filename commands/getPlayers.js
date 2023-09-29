const { SlashCommandBuilder } = require('discord.js');


const { db } = require('../libs/database');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('get-players')
		.setDescription('Gets all players'),
		
	args: [],
    permissions: [],

	async execute(interaction) { 
        interaction.reply('pong')
	},
};