const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Makes sure the bot is working"),

	args: [],
	permissions: [],

	async execute(interaction) {
		interaction.reply({ content: "pong", ephemeral: true });
	},
};
