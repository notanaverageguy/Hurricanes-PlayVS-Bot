const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Test command"),

	args: [],
	permissions: [],

	async execute(interaction) {
		interaction.reply("pong");
	},
};
